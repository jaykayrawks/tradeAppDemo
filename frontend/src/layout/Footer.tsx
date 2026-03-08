export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">

      {/* Left — disclaimer */}
      <p className="text-xs text-gray-400 leading-none">
        ⚠️ <span className="font-medium text-gray-500">Demo only.</span> No real trades are executed. Data is simulated.
      </p>

      {/* Center — nav links */}
      <div className="hidden md:flex items-center gap-5">
        {[
          { name: "Docs", url: "/docs" },
          { name: "Privacy", url: "/privacy" },
          { name: "Terms", url: "/terms" },
          { name: "Support", url: "/support" }
        ].map((link) => (
          <a
            key={link.name}
            href={link.url}
            className="text-xs text-gray-400 hover:text-blue-600 transition-colors font-medium tracking-wide"
          >
            {link.name}
          </a>
        ))}
      </div>

      {/* Right — version + copyright */}
      <div className="flex items-center gap-3">
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono tracking-tight">
          v1.0.0
        </span>
        <span className="text-xs text-gray-400">
          © {new Date().getFullYear()} Trade App Demo
        </span>
      </div>

    </footer>
  );
}
