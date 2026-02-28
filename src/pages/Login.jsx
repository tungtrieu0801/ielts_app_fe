import {GoogleLoginBox} from "../features/auth/components/GoogleLoginBox.jsx";

const Login = () => {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50">
            <GoogleLoginBox />
        </div>
    )
}

export default Login;