import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import cocoaLogo from "../../assets/img/cocoa-logo-white.png";
import { auth, db } from "../../utils/firebase";
import { doc, setDoc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import upload from "../../utils/upload";
import { toast } from "react-toastify";
import { Upload, FileText, X } from "lucide-react";

type Role = "buyer" | "vendor";

type BuyerForm = {
  role: "buyer";
  firstName: string;  // optional if you want to let them edit; can hide if you prefer Google name
  lastName: string;
  businessName: string;
  countryRegion: string;
  industry: string;
  categories: string;    // CSV input
  services: string[];    // BUYER: array
  phone: string;
  address: string;
};

type VendorForm = {
  role: "vendor";
  firstName: string;
  lastName: string;
  businessName: string;
  companyAddress: string; // VENDOR: has companyAddress
  countryRegion: string;
  industry: string;
  categories: string;     // CSV input
  services: string;       // VENDOR: single text field
};

type UploadedFile = { file: File; name: string; id: string };

const GoogleBusinessDetails: React.FC = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const role = (params.get("role") || "vendor").toLowerCase() as Role;

  const user = auth.currentUser;
  const uid = user?.uid;

  // If you want first/last to be editable here, initialize from displayName.
  const displayName = user?.displayName || "";
  const [defaultFirst, ...rest] = displayName.split(" ");
  const defaultLast = rest.join(" ");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [proofFile, setProofFile] = useState<File | null>(null); // vendors only
  const [uploadedDocs, setUploadedDocs] = useState<UploadedFile[]>([]); // if you want multiple vendor docs
  const [submitting, setSubmitting] = useState(false);

  const isBuyer = useMemo(() => role === "buyer", [role]);

  const [buyerForm, setBuyerForm] = useState<BuyerForm>({
    role: "buyer",
    firstName: defaultFirst || "",
    lastName: defaultLast || "",
    businessName: "",
    countryRegion: "",
    industry: "",
    categories: "",
    services: [],
    phone: "",
    address: "",
  });

  const [vendorForm, setVendorForm] = useState<VendorForm>({
    role: "vendor",
    firstName: defaultFirst || "",
    lastName: defaultLast || "",
    businessName: "",
    companyAddress: "",
    countryRegion: "",
    industry: "",
    categories: "",
    services: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (isBuyer) {
      setBuyerForm(prev => ({ ...prev, [name]: value }));
    } else {
      setVendorForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setAvatarFile(f);
      setAvatarPreview(URL.createObjectURL(f));
    }
  };

  const handleProofSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setProofFile(f);
  };

  const handleDocsMulti = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const list: UploadedFile[] = Array.from(files).map(file => ({
      file,
      name: file.name,
      id: Math.random().toString(36).slice(2, 9),
    }));
    setUploadedDocs(prev => [...prev, ...list]);
  };

  const removeDoc = (id: string) => {
    setUploadedDocs(prev => prev.filter(d => d.id !== id));
  };

  const addBuyerService = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = e.currentTarget as HTMLInputElement;
      const v = input.value.trim();
      if (!v) return;
      setBuyerForm(prev => ({ ...prev, services: [...prev.services, v] }));
      input.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) {
      toast.error("You are not signed in.");
      return;
    }
    setSubmitting(true);

    try {
      // 1) Avatar → avatars/{uid}
      let avatarUrl = "";
      if (avatarFile) {
        avatarUrl = await upload(avatarFile, { folder: "avatars", uid });
      }

      // 2) Common users/{uid} update
      await updateDoc(doc(db, "users", uid), {
        avatar: avatarUrl,
        emailVerified: !!user?.emailVerified,
        updatedAt: serverTimestamp(),
      });

      if (isBuyer) {
        // BUYER SHAPE
        const cats = buyerForm.categories
          .split(",")
          .map(s => s.trim().toLowerCase())
          .filter(Boolean);

        await setDoc(
          doc(db, "Buyers", uid),
          {
            uid,
            firstName: buyerForm.firstName,
            lastName: buyerForm.lastName,
            businessName: buyerForm.businessName,
            countryRegion: buyerForm.countryRegion,
            industry: buyerForm.industry,
            categories: cats,              // array
            services: buyerForm.services,  // string[]
            phone: buyerForm.phone,
            address: buyerForm.address,
            avatar: avatarUrl,
            emailVerified: !!user?.emailVerified,
            profileComplete: true,         // finished
            status: "pending",             // keep if you want admin gate; or remove if not gating
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        toast.success("Thank you for creating a profile with cocoa!");
        // send to buyer dashboard (or /await-approval if gating)
        navigate("/buyer-dashboard", { replace: true });

      } else {
        // VENDOR SHAPE
        const cats = vendorForm.categories
          .split(",")
          .map(s => s.trim().toLowerCase())
          .filter(Boolean);

        // Optional single proof:
        let proofUrl: string | null = null;
        if (proofFile) {
          proofUrl = await upload(proofFile, { folder: "documents", uid });
        }

        // Optional multiple docs:
        const moreDocUrls = await Promise.all(
          uploadedDocs.map(d => upload(d.file, { folder: "documents", uid }))
        );

        await setDoc(
          doc(db, "Vendors", uid),
          {
            uid,
            firstName: vendorForm.firstName,
            lastName: vendorForm.lastName,
            businessName: vendorForm.businessName,
            companyAddress: vendorForm.companyAddress,
            countryRegion: vendorForm.countryRegion,
            industry: vendorForm.industry,
            categories: cats,              // array
            services: vendorForm.services, // string
            avatar: avatarUrl,
            emailVerified: !!user?.emailVerified,
            profileComplete: true,
            status: "pending",
            updatedAt: serverTimestamp(),
            ...(proofUrl ? { documentUploaded: true, documents: arrayUnion(proofUrl) } : {}),
            ...(moreDocUrls.length ? { documents: arrayUnion(...moreDocUrls), documentUploaded: true } : {}),
          },
          { merge: true }
        );

        toast.success("Details saved!");
        // send to vendor dashboard (or /await-approval if gating)
        navigate("/vendor-dashboard", { replace: true });
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not save your details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="h-screen w-screen flex">
      {/* Left Panel (match your style) */}
      <div className="w-2/5 bg-[#7C77C1] p-8 flex flex-col justify-between">
        <div>
          <img src={cocoaLogo} alt="COCOA Logo White" className="mb-8 max-w-full h-auto" />
          <h2 className="text-2xl font-semibold text-white mb-4">Complete your {role} profile</h2>
          <p className="text-white/90 text-lg mb-2 leading-relaxed">
            To help you get started, we need a few business details.
            <br /><br />
            This only takes a minute.
          </p>
        </div>
        <p className="text-white/80">Fill out the form to continue.</p>
      </div>

      {/* Right Panel */}
      <div className="w-3/5 p-8 flex items-center justify-center">
        <form onSubmit={submit} className="w-full max-w-4xl grid grid-cols-2 gap-8">
          {/* Personal Details */}
          <div className="col-span-2">
            <h3 className="text-2xl font-semibold text-[#7C77C1] mb-4">Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#7C77C1]">First Name *</label>
                <input
                  name="firstName"
                  value={isBuyer ? buyerForm.firstName : vendorForm.firstName}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7C77C1]">Last Name *</label>
                <input
                  name="lastName"
                  value={isBuyer ? buyerForm.lastName : vendorForm.lastName}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-[#7C77C1] mb-1">Profile Picture</label>
            <div className="mb-2 flex items-center gap-4">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="w-16 h-16 object-cover rounded-full" />
              ) : (
                <p className="text-sm text-gray-500">No image selected</p>
              )}
              <label className="inline-flex items-center px-3 py-2 bg-[#7C77C1] text-white text-sm font-medium rounded-md cursor-pointer hover:bg-purple-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Avatar
                <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
              </label>
            </div>
          </div>

          {/* Business & Address */}
          <div className="col-span-2 grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#7C77C1]">Business Name *</label>
              <input
                name="businessName"
                value={isBuyer ? buyerForm.businessName : vendorForm.businessName}
                onChange={onChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />
            </div>
            {!isBuyer && (
              <div>
                <label className="block text-sm font-medium text-[#7C77C1]">Company Address *</label>
                <input
                  name="companyAddress"
                  value={vendorForm.companyAddress}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#7C77C1]">Country/Region *</label>
              <input
                name="countryRegion"
                value={isBuyer ? buyerForm.countryRegion : vendorForm.countryRegion}
                onChange={onChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Industry & Categories */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#7C77C1]">Industry *</label>
              <input
                name="industry"
                value={isBuyer ? buyerForm.industry : vendorForm.industry}
                onChange={onChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#7C77C1]">Categories *</label>
              <input
                name="categories"
                value={isBuyer ? buyerForm.categories : vendorForm.categories}
                onChange={onChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded"
                placeholder="e.g. logistics, packaging"
              />
            </div>
          </div>

          {/* Buyer Contact */}
          {isBuyer && (
            <div className="col-span-2">
              <h3 className="text-2xl font-semibold text-[#7C77C1] mb-4">Contact Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#7C77C1]">Phone *</label>
                  <input
                    name="phone"
                    value={buyerForm.phone}
                    onChange={onChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7C77C1]">Address *</label>
                  <input
                    name="address"
                    value={buyerForm.address}
                    onChange={onChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Services */}
          <div className="col-span-2">
            <h3 className="text-2xl font-semibold text-[#7C77C1] mb-4">Services</h3>

            {isBuyer ? (
              <>
                <p className="text-sm text-gray-500 mb-2">Type a service and press Enter to add.</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {buyerForm.services.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 border rounded-full text-sm">{s}</span>
                  ))}
                </div>
                <input
                  placeholder="Add a service and press Enter"
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                  onKeyDown={addBuyerService}
                />
              </>
            ) : (
              <textarea
                name="services"
                value={vendorForm.services}
                onChange={onChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded"
                rows={3}
                placeholder="Describe the services you offer"
              />
            )}
          </div>

          {/* Vendor Proof (optional here; you can make it required) */}
          {!isBuyer && (
            <div className="col-span-2">
              <h3 className="text-xl font-semibold text-[#7C77C1] mb-2">Business Documents</h3>
              <p className="text-sm text-gray-500 mb-3">Upload licenses, certifications, or any proof of business.</p>

              <div className="flex items-center gap-4 mb-4">
                <label className="inline-flex items-center px-4 py-2 bg-[#7C77C1] text-white text-sm font-medium rounded-md cursor-pointer hover:bg-purple-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                  <input type="file" onChange={handleProofSelect} className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                </label>

                <label className="inline-flex items-center px-4 py-2 bg-[#7C77C1] text-white text-sm font-medium rounded-md cursor-pointer hover:bg-purple-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload More
                  <input type="file" multiple onChange={handleDocsMulti} className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                </label>
              </div>

              {(proofFile || uploadedDocs.length > 0) && (
                <div className="space-y-2">
                  {proofFile && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-[#7C77C1] mr-3" />
                        <span className="text-sm text-gray-700">{proofFile.name}</span>
                      </div>
                    </div>
                  )}
                  {uploadedDocs.map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-[#7C77C1] mr-3" />
                        <span className="text-sm text-gray-700">{d.name}</span>
                      </div>
                      <button type="button" onClick={() => removeDoc(d.id)} className="text-gray-400 hover:text-red-500">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="col-span-2 flex items-end justify-end">
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2 bg-[#7C77C1] text-white rounded-lg transition ${submitting ? "opacity-60 cursor-not-allowed" : "hover:bg-[#5F5A9F]"}`}
            >
              {submitting ? "Saving…" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoogleBusinessDetails;
