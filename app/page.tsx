"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  salaryBand: string;
  experience: string;
  category: string;
  type: string;
  posted: string;
  deadline: string;
  featured?: boolean;
  color: string;
  initials: string;
  tags: string[];
};

const jobs: Job[] = [
  {
    id: 1,
    title: "Chuyên viên Marketing",
    company: "Công ty Cổ phần Truyền thông Sáng Tạo",
    location: "Cầu Giấy, Hà Nội",
    salary: "12 - 18 triệu",
    salaryBand: "10-20",
    experience: "1-2 năm",
    category: "Marketing",
    type: "Toàn thời gian",
    posted: "2 giờ trước",
    deadline: "Còn 12 ngày",
    featured: true,
    color: "#f97316",
    initials: "ST",
    tags: ["Content Marketing", "Facebook Ads"],
  },
  {
    id: 2,
    title: "Lập trình viên Front-end",
    company: "Công ty TNHH Công nghệ Bluewave",
    location: "Nam Từ Liêm, Hà Nội",
    salary: "18 - 28 triệu",
    salaryBand: "20-30",
    experience: "1-2 năm",
    category: "Công nghệ thông tin",
    type: "Toàn thời gian",
    posted: "5 giờ trước",
    deadline: "Còn 18 ngày",
    featured: true,
    color: "#2563eb",
    initials: "BW",
    tags: ["ReactJS", "TypeScript"],
  },
  {
    id: 3,
    title: "Thực tập sinh Nhân sự",
    company: "Tập đoàn Giáo dục Ánh Dương",
    location: "Đống Đa, Hà Nội",
    salary: "3 - 5 triệu",
    salaryBand: "Dưới 10",
    experience: "Không yêu cầu",
    category: "Nhân sự",
    type: "Thực tập",
    posted: "Hôm nay",
    deadline: "Còn 20 ngày",
    color: "#7c3aed",
    initials: "AD",
    tags: ["Tuyển dụng", "Đào tạo"],
  },
  {
    id: 4,
    title: "Nhân viên Kinh doanh",
    company: "Công ty Cổ phần Green House",
    location: "Hai Bà Trưng, Hà Nội",
    salary: "10 - 25 triệu",
    salaryBand: "10-20",
    experience: "Dưới 1 năm",
    category: "Kinh doanh",
    type: "Toàn thời gian",
    posted: "1 ngày trước",
    deadline: "Còn 9 ngày",
    color: "#16a34a",
    initials: "GH",
    tags: ["B2B", "Tư vấn khách hàng"],
  },
  {
    id: 5,
    title: "Nhân viên Thiết kế đồ họa",
    company: "Hanoi Creative Studio",
    location: "Ba Đình, Hà Nội",
    salary: "10 - 15 triệu",
    salaryBand: "10-20",
    experience: "1-2 năm",
    category: "Thiết kế",
    type: "Toàn thời gian",
    posted: "1 ngày trước",
    deadline: "Còn 15 ngày",
    color: "#db2777",
    initials: "HC",
    tags: ["Figma", "Adobe Illustrator"],
  },
  {
    id: 6,
    title: "Cộng tác viên Tư vấn tuyển sinh",
    company: "Trung tâm Ngoại ngữ Horizon",
    location: "Hà Nội",
    salary: "6 - 10 triệu",
    salaryBand: "Dưới 10",
    experience: "Không yêu cầu",
    category: "Giáo dục",
    type: "Bán thời gian",
    posted: "2 ngày trước",
    deadline: "Còn 7 ngày",
    color: "#0891b2",
    initials: "HZ",
    tags: ["Part-time", "Giao tiếp"],
  },
];

const categories = [
  { icon: "💻", name: "Công nghệ thông tin", count: 286, tone: "blue" },
  { icon: "📣", name: "Marketing", count: 194, tone: "orange" },
  { icon: "📈", name: "Kinh doanh", count: 328, tone: "green" },
  { icon: "🎨", name: "Thiết kế", count: 112, tone: "pink" },
  { icon: "👥", name: "Nhân sự", count: 87, tone: "purple" },
  { icon: "🎓", name: "Thực tập sinh", count: 154, tone: "cyan" },
];

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("Tất cả ngành nghề");
  const [salary, setSalary] = useState("Tất cả mức lương");
  const [experience, setExperience] = useState("Tất cả kinh nghiệm");
  const [filters, setFilters] = useState({ keyword: "", category, salary, experience });
  const [saved, setSaved] = useState<number[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredJobs = useMemo(() => {
    const term = filters.keyword.toLocaleLowerCase("vi");
    return jobs.filter((job) => {
      const matchesText =
        !term ||
        `${job.title} ${job.company} ${job.tags.join(" ")}`
          .toLocaleLowerCase("vi")
          .includes(term);
      const matchesCategory =
        filters.category === "Tất cả ngành nghề" || job.category === filters.category;
      const matchesSalary =
        filters.salary === "Tất cả mức lương" || job.salaryBand === filters.salary;
      const matchesExperience =
        filters.experience === "Tất cả kinh nghiệm" ||
        job.experience === filters.experience;
      return matchesText && matchesCategory && matchesSalary && matchesExperience;
    });
  }, [filters]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setFilters({ keyword, category, salary, experience });
    document.getElementById("viec-lam")?.scrollIntoView({ behavior: "smooth" });
  }

  function chooseCategory(name: string) {
    const mapped = name === "Thực tập sinh" ? "Tất cả ngành nghề" : name;
    setCategory(mapped);
    setFilters((current) => ({ ...current, category: mapped }));
    document.getElementById("viec-lam")?.scrollIntoView({ behavior: "smooth" });
  }

  function toggleSave(id: number) {
    setSaved((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <main>
      <header className="site-header">
        <div className="topline">
          <div className="container topline-inner">
            <span>🏛️ Nền tảng việc làm chính thống dành cho thanh niên Thủ đô</span>
            <span className="top-contact">☎ 024 3858 2525 · ✉ hotro@vieclamthanhnien.vn</span>
          </div>
        </div>
        <nav className="container nav">
          <a className="brand" href="#" aria-label="Trang chủ">
            <span className="brand-mark">V</span>
            <span>
              <strong>VIỆC LÀM</strong>
              <small>THANH NIÊN HÀ NỘI</small>
            </span>
          </a>
          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Mở menu"
            aria-expanded={menuOpen}
          >
            ☰
          </button>
          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            <a className="active" href="#">Trang chủ</a>
            <a href="#viec-lam">Việc làm</a>
            <a href="#nganh-nghe">Ngành nghề</a>
            <a href="#cam-nang">Cẩm nang</a>
            <a href="#lien-he">Liên hệ</a>
          </div>
          <div className="nav-actions">
            <Link className="btn btn-ghost" href="/dang-nhap">Đăng nhập</Link>
            <Link className="btn btn-primary" href="/dang-ky">Đăng ký</Link>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="container hero-content">
          <div className="eyebrow">CƠ HỘI MỚI · TƯƠNG LAI MỚI</div>
          <h1>Tìm đúng việc.<br /><span>Vững tương lai.</span></h1>
          <p>
            Kết nối thanh niên Hà Nội với hàng nghìn cơ hội việc làm minh bạch,
            uy tín và đã được kiểm duyệt.
          </p>
          <form className="search-panel" onSubmit={handleSearch}>
            <label className="search-field keyword-field">
              <span className="field-icon">⌕</span>
              <span>
                <small>Từ khóa</small>
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Vị trí, kỹ năng hoặc công ty"
                />
              </span>
            </label>
            <label className="search-field">
              <span className="field-icon">▦</span>
              <span>
                <small>Ngành nghề</small>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option>Tất cả ngành nghề</option>
                  <option>Công nghệ thông tin</option>
                  <option>Marketing</option>
                  <option>Kinh doanh</option>
                  <option>Thiết kế</option>
                  <option>Nhân sự</option>
                  <option>Giáo dục</option>
                </select>
              </span>
            </label>
            <label className="search-field">
              <span className="field-icon">₫</span>
              <span>
                <small>Mức lương</small>
                <select value={salary} onChange={(event) => setSalary(event.target.value)}>
                  <option>Tất cả mức lương</option>
                  <option>Dưới 10</option>
                  <option>10-20</option>
                  <option>20-30</option>
                </select>
              </span>
            </label>
            <label className="search-field">
              <span className="field-icon">◷</span>
              <span>
                <small>Kinh nghiệm</small>
                <select
                  value={experience}
                  onChange={(event) => setExperience(event.target.value)}
                >
                  <option>Tất cả kinh nghiệm</option>
                  <option>Không yêu cầu</option>
                  <option>Dưới 1 năm</option>
                  <option>1-2 năm</option>
                </select>
              </span>
            </label>
            <button className="search-button" type="submit">Tìm việc ngay →</button>
          </form>
          <div className="quick-search">
            <span>Tìm kiếm phổ biến:</span>
            {["Thực tập sinh", "Marketing", "Lập trình viên", "Bán thời gian"].map((item) => (
              <button key={item} onClick={() => { setKeyword(item); setFilters((f) => ({ ...f, keyword: item })); }}>
                {item}
              </button>
            ))}
          </div>
          <div className="stats">
            <div><strong>1.200+</strong><span>Việc làm đang tuyển</span></div>
            <div><strong>680+</strong><span>Doanh nghiệp uy tín</span></div>
            <div><strong>8.500+</strong><span>Ứng viên kết nối</span></div>
            <div><strong>92%</strong><span>Tin đã kiểm duyệt</span></div>
          </div>
        </div>
      </section>

      <section className="section categories-section" id="nganh-nghe">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">KHÁM PHÁ CƠ HỘI</span>
              <h2>Ngành nghề nổi bật</h2>
              <p>Lựa chọn lĩnh vực phù hợp với năng lực và định hướng của bạn.</p>
            </div>
            <a href="#viec-lam">Xem tất cả ngành nghề →</a>
          </div>
          <div className="category-grid">
            {categories.map((item) => (
              <button
                className="category-card"
                key={item.name}
                onClick={() => chooseCategory(item.name)}
              >
                <span className={`category-icon ${item.tone}`}>{item.icon}</span>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.count} việc làm</small>
                </span>
                <b>→</b>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section jobs-section" id="viec-lam">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">VIỆC LÀM ĐƯỢC KIỂM DUYỆT</span>
              <h2>Cơ hội việc làm mới nhất</h2>
              <p>Cập nhật mỗi ngày từ các doanh nghiệp đã được xác thực.</p>
            </div>
            <a href="#">Xem tất cả việc làm →</a>
          </div>

          <div className="jobs-layout">
            <div className="job-list">
              <div className="results-bar">
                <span>Tìm thấy <strong>{filteredJobs.length}</strong> việc làm phù hợp</span>
                {(filters.keyword || filters.category !== "Tất cả ngành nghề" || filters.salary !== "Tất cả mức lương" || filters.experience !== "Tất cả kinh nghiệm") && (
                  <button onClick={() => {
                    setKeyword("");
                    setCategory("Tất cả ngành nghề");
                    setSalary("Tất cả mức lương");
                    setExperience("Tất cả kinh nghiệm");
                    setFilters({ keyword: "", category: "Tất cả ngành nghề", salary: "Tất cả mức lương", experience: "Tất cả kinh nghiệm" });
                  }}>Xóa bộ lọc</button>
                )}
              </div>
              {filteredJobs.length ? filteredJobs.map((job) => (
                <article className="job-card" key={job.id}>
                  {job.featured && <span className="verified-ribbon">✓ Nổi bật</span>}
                  <div className="company-logo" style={{ background: job.color }}>{job.initials}</div>
                  <div className="job-main">
                    <div className="job-title-row">
                      <div>
                        <h3>{job.title}</h3>
                        <p className="company-name">{job.company} <span title="Doanh nghiệp đã xác thực">✓</span></p>
                      </div>
                      <button
                        className={`save-button ${saved.includes(job.id) ? "saved" : ""}`}
                        onClick={() => toggleSave(job.id)}
                        aria-label={saved.includes(job.id) ? "Bỏ lưu việc làm" : "Lưu việc làm"}
                      >
                        {saved.includes(job.id) ? "♥" : "♡"}
                      </button>
                    </div>
                    <div className="job-meta">
                      <span>⌖ {job.location}</span>
                      <span className="salary">₫ {job.salary}</span>
                      <span>◷ {job.experience}</span>
                    </div>
                    <div className="job-footer">
                      <div>{job.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
                      <small>{job.posted} · <b>{job.deadline}</b></small>
                    </div>
                  </div>
                </article>
              )) : (
                <div className="empty-state">
                  <span>⌕</span>
                  <h3>Chưa tìm thấy việc làm phù hợp</h3>
                  <p>Hãy thử thay đổi từ khóa hoặc mở rộng bộ lọc của bạn.</p>
                </div>
              )}
              <button className="load-more">Xem thêm việc làm <span>↓</span></button>
            </div>

            <aside>
              <div className="support-card">
                <div className="support-icon">✓</div>
                <span className="section-kicker">ĐỒNG HÀNH CÙNG BẠN</span>
                <h3>Bạn chưa biết bắt đầu từ đâu?</h3>
                <p>Đội ngũ tư vấn của Trung tâm sẽ hỗ trợ hoàn thiện hồ sơ và định hướng nghề nghiệp miễn phí.</p>
                <button>Đăng ký tư vấn →</button>
                <small>Hoàn toàn miễn phí · Bảo mật thông tin</small>
              </div>
              <div className="notice-card">
                <strong>🛡️ Việc làm an toàn</strong>
                <p>Mọi tin tuyển dụng đều được Trung tâm kiểm tra trước khi hiển thị.</p>
                <a href="#">Tìm hiểu quy trình kiểm duyệt →</a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="guide-section" id="cam-nang">
        <div className="container guide-inner">
          <div>
            <span className="section-kicker">BẮT ĐẦU CHỈ VỚI 3 BƯỚC</span>
            <h2>Chạm tới công việc mơ ước</h2>
            <p>Quy trình đơn giản, minh bạch và luôn có người đồng hành.</p>
          </div>
          <div className="steps">
            <div><b>01</b><span><strong>Tạo hồ sơ</strong><small>Giới thiệu kỹ năng và kinh nghiệm</small></span></div>
            <div><b>02</b><span><strong>Tìm việc phù hợp</strong><small>Lọc theo nhu cầu của bạn</small></span></div>
            <div><b>03</b><span><strong>Ứng tuyển & theo dõi</strong><small>Cập nhật trạng thái minh bạch</small></span></div>
          </div>
          <button className="btn btn-light">Tạo hồ sơ ngay →</button>
        </div>
      </section>

      <footer id="lien-he">
        <div className="container footer-grid">
          <div className="footer-brand">
            <a className="brand brand-light" href="#">
              <span className="brand-mark">V</span>
              <span><strong>VIỆC LÀM</strong><small>THANH NIÊN HÀ NỘI</small></span>
            </a>
            <p>Nền tảng kết nối cung – cầu lao động chính thống của Trung tâm Dịch vụ Việc làm Thanh niên Hà Nội.</p>
          </div>
          <div><h4>Dành cho ứng viên</h4><a href="#viec-lam">Tìm việc làm</a><a href="#">Tạo hồ sơ</a><a href="#">Việc làm đã ứng tuyển</a></div>
          <div><h4>Dành cho nhà tuyển dụng</h4><a href="#">Đăng tin tuyển dụng</a><a href="#">Tìm kiếm ứng viên</a><a href="#">Quản lý tuyển dụng</a></div>
          <div><h4>Liên hệ</h4><p>14A Phan Chu Trinh, Hoàn Kiếm, Hà Nội</p><p>024 3858 2525</p><p>hotro@vieclamthanhnien.vn</p></div>
        </div>
        <div className="container copyright">
          <span>© 2026 Trung tâm Dịch vụ Việc làm Thanh niên Hà Nội</span>
          <span>Điều khoản sử dụng · Chính sách bảo mật</span>
        </div>
      </footer>
    </main>
  );
}
