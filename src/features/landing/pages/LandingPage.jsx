import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/useAuthStore';
import './LandingPage.css';

const FEATURES = [
    {
        icon: '🧠',
        title: 'Spaced Repetition (SRS)',
        desc: 'Thuật toán lặp lại ngắt quãng thông minh, tự động lên lịch ôn tập tối ưu cho từng từ vựng — giúp bạn nhớ lâu hơn gấp 3 lần.',
    },
    {
        icon: '🃏',
        title: 'Flashcard 3D',
        desc: 'Flashcard lật 3D mượt mà với phiên âm IPA, loại từ, ví dụ minh hoạ — trải nghiệm học trực quan và thú vị.',
    },
    {
        icon: '🎧',
        title: 'Dictation & Listening',
        desc: 'Luyện nghe chép chính tả từ YouTube và văn bản. Kiểm tra khả năng nghe hiểu thực tế với nội dung đa dạng.',
    },
    {
        icon: '⚔️',
        title: 'Multiplayer Game',
        desc: 'Thi đấu từ vựng real-time với bạn bè qua WebSocket. Tạo phòng, mời bạn bè, so tài kiến thức.',
    },
    {
        icon: '📊',
        title: 'Streak & Heatmap',
        desc: 'Theo dõi chuỗi ngày học liên tiếp với heatmap trực quan. Xem thống kê chi tiết và bảng xếp hạng streak.',
    },
    {
        icon: '📁',
        title: 'Import & Chia sẻ',
        desc: 'Import từ vựng từ file Excel, tạo bộ từ cá nhân. Fork bộ từ công khai của cộng đồng để học ngay.',
    },
];

const STEPS = [
    {
        num: 1,
        title: 'Đăng nhập nhanh',
        desc: 'Chỉ cần tài khoản Google, 1 click là bắt đầu học ngay.',
    },
    {
        num: 2,
        title: 'Tạo bộ từ vựng',
        desc: 'Import từ Excel hoặc thêm thủ công, fork từ cộng đồng.',
    },
    {
        num: 3,
        title: 'Học & Ôn tập mỗi ngày',
        desc: 'SRS tự động nhắc ôn, kết hợp flashcard, fill-in, nghe-gõ.',
    },
];

const TESTIMONIALS = [
    {
        text: '"Mình đã thử nhiều app học từ vựng nhưng SRS ở đây thực sự hiệu quả. Nhớ từ lâu hơn hẳn!"',
        name: 'Minh Anh',
        role: 'IELTS 7.5',
        initial: 'M',
    },
    {
        text: '"Tính năng Dictation từ YouTube quá xịn. Vừa nghe nhạc vừa luyện listening, không còn chán nữa."',
        name: 'Hoàng Long',
        role: 'IELTS 8.0',
        initial: 'H',
    },
    {
        text: '"Game multiplayer giúp mình và bạn bè ôn từ vựng cùng nhau, vui và hiệu quả hơn nhiều."',
        name: 'Thu Hà',
        role: 'IELTS 7.0',
        initial: 'T',
    },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const token = useAuthStore((s) => s.token);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (token) navigate('/home');
    }, [token, navigate]);

    // Check dark mode
    useEffect(() => {
        const html = document.documentElement;
        setIsDark(html.classList.contains('dark'));

        const observer = new MutationObserver(() => {
            setIsDark(html.classList.contains('dark'));
        });
        observer.observe(html, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Toggle dark mode
    const toggleDark = () => {
        const html = document.documentElement;
        html.classList.toggle('dark');
        setIsDark(html.classList.contains('dark'));
    };

    // Intersection Observer for scroll animations
    useEffect(() => {
        const elements = document.querySelectorAll('.landing-animate');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.15 }
        );
        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const handleGetStarted = () => {
        navigate('/login');
    };

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        setMobileOpen(false);
    };

    return (
        <div className="landing-page">
            {/* Background Orbs */}
            <div className="landing-bg-orbs">
                <div className="landing-orb landing-orb-1" />
                <div className="landing-orb landing-orb-2" />
                <div className="landing-orb landing-orb-3" />
            </div>

            {/* Navigation */}
            <nav className="landing-nav" id="landing-nav">
                <div className="landing-nav-brand">
                    <div className="landing-nav-logo">🎯</div>
                    <span className="landing-nav-title">IELTS Vocab</span>
                </div>

                <div className="landing-nav-links">
                    <button className="landing-nav-link" onClick={() => scrollTo('features')}>
                        Tính năng
                    </button>
                    <button className="landing-nav-link" onClick={() => scrollTo('how-it-works')}>
                        Cách dùng
                    </button>
                    <button className="landing-nav-link" onClick={() => scrollTo('testimonials')}>
                        Đánh giá
                    </button>
                    <button className="landing-dark-toggle" onClick={toggleDark} aria-label="Toggle dark mode" id="dark-mode-toggle">
                        {isDark ? '☀️' : '🌙'}
                    </button>
                    <Link to="/login" className="landing-nav-cta" id="nav-login-btn">
                        Bắt đầu miễn phí →
                    </Link>
                </div>

                <button className="landing-nav-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" id="mobile-menu-toggle">
                    {mobileOpen ? '✕' : '☰'}
                </button>
            </nav>

            {/* Mobile Menu */}
            <div className={`landing-mobile-menu ${mobileOpen ? 'open' : ''}`} id="mobile-menu">
                <button className="landing-nav-link" onClick={() => scrollTo('features')}>
                    Tính năng
                </button>
                <button className="landing-nav-link" onClick={() => scrollTo('how-it-works')}>
                    Cách dùng
                </button>
                <button className="landing-nav-link" onClick={() => scrollTo('testimonials')}>
                    Đánh giá
                </button>
                <button className="landing-dark-toggle" onClick={toggleDark} style={{ margin: '0 auto' }}>
                    {isDark ? '☀️' : '🌙'}
                </button>
                <Link to="/login" className="landing-nav-cta" onClick={() => setMobileOpen(false)}>
                    Bắt đầu miễn phí →
                </Link>
            </div>

            {/* Hero */}
            <section className="landing-hero" id="hero">
                <div className="landing-hero-inner">
                    <div className="landing-badge">
                        <span className="landing-badge-dot" />
                        Miễn phí · Không giới hạn · Mã nguồn mở
                    </div>

                    <h1 className="landing-hero-title">
                        Chinh phục từ vựng IELTS
                        <br />
                        <span className="landing-hero-title-gradient">
                            thông minh & hiệu quả
                        </span>
                    </h1>

                    <p className="landing-hero-subtitle">
                        Ứng dụng học từ vựng IELTS toàn diện với thuật toán SRS, flashcard 3D, 
                        luyện nghe dictation, và game đối kháng real-time. Được thiết kế cho 
                        người Việt.
                    </p>

                    <div className="landing-hero-actions">
                        <button className="landing-btn-primary" onClick={handleGetStarted} id="hero-cta-btn">
                            🚀 Bắt đầu học ngay
                        </button>
                        <button className="landing-btn-secondary" onClick={() => scrollTo('features')} id="hero-features-btn">
                            Xem tính năng ↓
                        </button>
                    </div>

                    <div className="landing-hero-stats">
                        <div className="landing-stat">
                            <div className="landing-stat-value">7+</div>
                            <div className="landing-stat-label">Chế độ học</div>
                        </div>
                        <div className="landing-stat">
                            <div className="landing-stat-value">SRS</div>
                            <div className="landing-stat-label">Thuật toán tối ưu</div>
                        </div>
                        <div className="landing-stat">
                            <div className="landing-stat-value">100%</div>
                            <div className="landing-stat-label">Miễn phí</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="landing-section" id="features">
                <div className="landing-section-header landing-animate">
                    <div className="landing-section-label">Tính năng nổi bật</div>
                    <h2 className="landing-section-title">
                        Mọi thứ bạn cần để chinh phục IELTS Vocabulary
                    </h2>
                    <p className="landing-section-desc">
                        Từ Spaced Repetition, Flashcard 3D cho đến Dictation và Game — tất cả 
                        trong một ứng dụng duy nhất.
                    </p>
                </div>

                <div className="landing-features-grid">
                    {FEATURES.map((f, i) => (
                        <div
                            className="landing-feature-card landing-animate"
                            key={f.title}
                            style={{ transitionDelay: `${i * 0.1}s` }}
                        >
                            <div className="landing-feature-icon">{f.icon}</div>
                            <h3 className="landing-feature-title">{f.title}</h3>
                            <p className="landing-feature-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="landing-section" id="how-it-works">
                <div className="landing-section-header landing-animate">
                    <div className="landing-section-label">Cách sử dụng</div>
                    <h2 className="landing-section-title">3 bước để bắt đầu</h2>
                    <p className="landing-section-desc">
                        Đơn giản, nhanh chóng — bạn có thể bắt đầu học trong vòng 30 giây.
                    </p>
                </div>

                <div className="landing-steps landing-animate">
                    {STEPS.map((s) => (
                        <div className="landing-step" key={s.num}>
                            <div className="landing-step-num">{s.num}</div>
                            <h3 className="landing-step-title">{s.title}</h3>
                            <p className="landing-step-desc">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section className="landing-section" id="testimonials">
                <div className="landing-section-header landing-animate">
                    <div className="landing-section-label">Đánh giá</div>
                    <h2 className="landing-section-title">Người dùng nói gì?</h2>
                    <p className="landing-section-desc">
                        Hàng trăm người đã sử dụng và đạt band điểm mong muốn.
                    </p>
                </div>

                <div className="landing-testimonials-grid landing-animate">
                    {TESTIMONIALS.map((t) => (
                        <div className="landing-testimonial" key={t.name}>
                            <p className="landing-testimonial-text">{t.text}</p>
                            <div className="landing-testimonial-author">
                                <div className="landing-testimonial-avatar">{t.initial}</div>
                                <div>
                                    <div className="landing-testimonial-name">{t.name}</div>
                                    <div className="landing-testimonial-role">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="landing-cta-section" id="cta">
                <div className="landing-cta-box landing-animate">
                    <div className="landing-cta-glow" />
                    <h2 className="landing-cta-title">
                        Sẵn sàng nâng cấp vốn từ vựng IELTS?
                    </h2>
                    <p className="landing-cta-desc">
                        Đăng ký miễn phí ngay hôm nay và bắt đầu hành trình chinh phục IELTS 
                        cùng thuật toán SRS thông minh.
                    </p>
                    <button className="landing-cta-btn" onClick={handleGetStarted} id="cta-btn">
                        🎯 Đăng ký miễn phí ngay
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer" id="landing-footer">
                <p className="landing-footer-text">
                    © 2026 IELTS Vocab. Được xây dựng với ❤️ cho cộng đồng học IELTS Việt Nam.
                </p>
                <div className="landing-footer-links">
                    <a href="#features" className="landing-footer-link" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>
                        Tính năng
                    </a>
                    <a href="#how-it-works" className="landing-footer-link" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }}>
                        Hướng dẫn
                    </a>
                    <a href="#testimonials" className="landing-footer-link" onClick={(e) => { e.preventDefault(); scrollTo('testimonials'); }}>
                        Đánh giá
                    </a>
                </div>
            </footer>
        </div>
    );
}
