import { GoogleLoginBox } from "../components/GoogleLoginBox.jsx";

const LoginPage = () => {
    return (
        <>
            {/* CSS class-based dark/light background — không cần useColorMode hook */}
            <style>{`
                .login-page-bg {
                    min-height: 100vh;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
                    transition: background 0.5s ease;
                }
                .dark .login-page-bg {
                    background: linear-gradient(135deg, #0d0d12 0%, #12101e 40%, #110d1a 100%);
                }
                .login-blob {
                    position: fixed;
                    border-radius: 50%;
                    pointer-events: none;
                    animation: blobPulse 7s ease-in-out infinite;
                }
                .login-blob-1 {
                    top: -80px; right: -80px;
                    width: 360px; height: 360px;
                    background: rgba(255,255,255,0.1);
                }
                .dark .login-blob-1 {
                    background: radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%);
                }
                .login-blob-2 {
                    bottom: -100px; left: -60px;
                    width: 300px; height: 300px;
                    background: rgba(255,255,255,0.07);
                    animation-delay: -3s;
                    animation-direction: reverse;
                }
                .dark .login-blob-2 {
                    background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
                }
                /* Star particles for dark mode */
                .login-star {
                    position: fixed;
                    border-radius: 50%;
                    background: rgba(165,180,252,0);
                    pointer-events: none;
                    transition: background 0.5s ease;
                }
                .dark .login-star {
                    background: rgba(165,180,252,0.5);
                }
                @keyframes blobPulse {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.12); opacity: 1; }
                }
            `}</style>

            <div className="login-page-bg">
                <div className="login-blob login-blob-1" />
                <div className="login-blob login-blob-2" />

                {/* Star particles */}
                <div className="login-star" style={{ top:'15%', left:'10%', width:'2px', height:'2px' }} />
                <div className="login-star" style={{ top:'30%', right:'15%', width:'1.5px', height:'1.5px' }} />
                <div className="login-star" style={{ top:'65%', left:'20%', width:'1px', height:'1px' }} />
                <div className="login-star" style={{ top:'80%', right:'25%', width:'2px', height:'2px' }} />
                <div className="login-star" style={{ top:'45%', left:'5%', width:'1.5px', height:'1.5px' }} />
                <div className="login-star" style={{ top:'55%', right:'8%', width:'1px', height:'1px' }} />

                <GoogleLoginBox />
            </div>
        </>
    );
};

export default LoginPage;