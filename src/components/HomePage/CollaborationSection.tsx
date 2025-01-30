import fourCards from "../../assets/img/sectionTwo/four_cards.png";
const CollaborationSection = () => {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-1 md:px-28 py-2 bg-white ">
      {/* Left side: Just one big image */}
      <div className="md:w-full flex justify-center md:justify-start ">
        <img
          src={fourCards}
          alt="COCOA four-cards composite"
          className="max-w-full h-auto rounded-lg "
        />
      </div>

      {/* Right Side: Text Content */}
      <div className="font-nunito mt-5 md:mt-20 text-center md:text-left max-w-xl">
        <h2 className="text-[50px] text-3xl font-bold text-gray-800 leading-[3.5rem]">
          Connect, chat,
          <br className="pt-6 loading-6" /> collaborate and <br /> grow with
          COCOA
        </h2>
        <p className="text[19px]  mt-4">
          Designed to revolutionize digital procurement and B2B <br />communication
          through our innovative chat-based platform! <br />With instant messaging for
          enterprise procurement,<br /> streamlined digital workflows, and seamless
          document<br /> collaboration, COCOA empowers corporate teams to make
          quicker, more informed decisions in real-time.
        </p>
        <button className="font-nunito mt-6 px-14 text-[18px] py-3 bg-buttonBg text-white font-semibold rounded-full shadow-md">
          Start Exploring
        </button>
      </div>
    </section>
  );
};

export default CollaborationSection;
