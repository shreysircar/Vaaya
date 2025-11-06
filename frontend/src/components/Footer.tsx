import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full py-10 bg-neutral-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div>
          {/* Logo Section */}
          <div className="flex items-center mb-3">
            <Image
              src="/logo1.svg" 
              alt="Via Logo"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>

          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            India's favorite online furniture destination. Quality steel and
            wood furniture with hassle-free delivery.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="/shop"
                className="hover:text-[#dec08a] transition-colors duration-200"
              >
                Shop
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="hover:text-[#dec08a] transition-colors duration-200"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="hover:text-[#dec08a] transition-colors duration-200"
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href="/faq"
                className="hover:text-[#dec08a] transition-colors duration-200"
              >
                FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Contact / Social */}
        <div>
          <h4 className="text-white font-semibold mb-3">Connect</h4>
          <p className="text-sm mb-2">Email: support@eshop.com</p>
          <p className="text-sm mb-2">Phone: +1 234 567 890</p>

          <div className="flex space-x-4 mt-3">
            <a
              href="#"
              className="hover:text-[#dec08a] transition-colors text-sm"
            >
              LinkedIn
            </a>
            <a
              href="#"
              className="hover:text-[#dec08a] transition-colors text-sm"
            >
              Instagram
            </a>
            <a
              href="#"
              className="hover:text-[#dec08a] transition-colors text-sm"
            >
              Twitter
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-gray-500 text-xs mt-10">
        &copy; {new Date().getFullYear()} Vaaya. All rights reserved.
      </div>
    </footer>
  );
}
