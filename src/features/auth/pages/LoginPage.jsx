import {GoogleLoginBox} from "../components/GoogleLoginBox.jsx";

const LoginPage = () => {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50">
            <GoogleLoginBox />
        </div>
    )
}

export default LoginPage;