import { useState } from 'react'
import './login.css'
import { toast } from 'react-toastify'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth, db } from '../../utils/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { setPersistence, browserLocalPersistence } from 'firebase/auth'
import upload from '../../utils/upload'
import bg from '../../assets/images/bg.png'
import fictLogo from '../../assets/images/FICT-Login-Logo.png'
import { useUserStore } from '../../utils/userStore'

const Login = () => {
    const { fetchUserInfo } = useUserStore()
    const [avatar, setAvatar] = useState({
        file: null,
        url: '',
    })

    const [loading, setLoading] = useState(false)
    const [registerForm, setRegisterForm] = useState(false)

    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            })
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.target)

        const { username, email, password } = Object.fromEntries(formData)

        if (!username || !email || !password)
            return toast.warn('Please enter inputs!')
        if (!avatar.file) return toast.warn('Please upload an avatar!')

        try {
            const res = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            )
            const imgUrl = await upload(avatar.file)

            await setDoc(doc(db, 'users', res.user.uid), {
                username,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: [],
            })

            await setDoc(doc(db, 'userchats', res.user.uid), {
                chats: [],
            })

            toast.success('Account created! You can login now!')
        } catch (err) {
            console.log(err)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.target)
        const { email, password } = Object.fromEntries(formData)

        try {
            // Set local persistence so that user is not logged out on refresh or browser close
            await setPersistence(auth, browserLocalPersistence)

            // After persistence is set, sign in the user
            await signInWithEmailAndPassword(auth, email, password).then(
                (res) => {
                    const userId = res.user.uid

                    localStorage.setItem('user', JSON.stringify(userId))
                    fetchUserInfo(userId)
                }
            )

            toast.success('Login successful!')
        } catch (err) {
            console.error('Login error:', err.message)
            toast.error(`Login failed: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="login">
            <img src={bg} className="login-image" alt="Background" />
            <div className="separator" />

            {!registerForm ? (
                <div className="item">
                    <img className="logo" src={fictLogo} alt="FICT Logo" />
                    <h2>Welcome Back To</h2>
                    <p style={{ textAlign: 'center', marginBottom: '30px' }}>
                        Fast Intercompany Communication Tool
                    </p>

                    <form onSubmit={handleLogin}>
                        <input type="text" placeholder="Email" name="email" />
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                        />
                        <button disabled={loading}>
                            {loading ? 'Loading' : 'Log In'}
                        </button>
                    </form>
                    <p className="authentication">
                        Don't have an account?{' '}
                        <span
                            style={{
                                cursor: 'pointer',
                                color: 'white',
                            }}
                            onClick={() => setRegisterForm(true)}
                        >
                            Register Now
                        </span>
                    </p>
                </div>
            ) : (
                <div className="item">
                    <img className="logo" src={fictLogo} alt="FICT Logo" />
                    <p style={{ textAlign: 'center', marginBottom: '10px' }}>
                        Fast Intercompany Communication Tool
                    </p>
                    <h2>Create an Account</h2>
                    <form onSubmit={handleRegister}>
                        <label htmlFor="file">
                            <img
                                className="avatar"
                                src={avatar.url || './avatar.png'}
                                alt="Avatar"
                            />
                            Upload an image
                        </label>
                        <input
                            type="file"
                            id="file"
                            style={{ display: 'none' }}
                            onChange={handleAvatar}
                        />
                        <input
                            type="text"
                            placeholder="Username"
                            name="username"
                        />
                        <input type="text" placeholder="Email" name="email" />
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                        />
                        <button disabled={loading}>
                            {loading ? 'Loading' : 'Register'}
                        </button>
                    </form>
                    <p className="authentication">
                        Already have an account?{' '}
                        <span
                            style={{
                                cursor: 'pointer',
                                color: 'white',
                            }}
                            onClick={() => setRegisterForm(false)}
                        >
                            Login Now
                        </span>
                    </p>
                </div>
            )}
        </div>
    )
}

export default Login
