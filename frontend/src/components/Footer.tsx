export default function Footer() {
  const DARK_TEAL = "#014755"; // consistent dark teal
  const LIGHT_TEXT = "#E0E0E0"; // light gray text

  return (
    <footer className={`bg-[${DARK_TEAL}] text-[${LIGHT_TEXT}] py-10 w-full`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-white font-bold text-lg mb-3">E-Shop</h3>
          <p className="text-gray-300 text-sm">
            Your one-stop destination for premium furniture, electronics, and home essentials.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/shop" className="hover:text-white">Shop</a></li>
            <li><a href="/about" className="hover:text-white">About Us</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
            <li><a href="/faq" className="hover:text-white">FAQ</a></li>
          </ul>
        </div>

        {/* Contact / Social */}
        <div>
          <h4 className="text-white font-semibold mb-3">Connect</h4>
          <p className="text-sm mb-2">Email: support@eshop.com</p>
          <p className="text-sm mb-2">Phone: +1 234 567 890</p>
          <div className="flex space-x-3 mt-2">
            <a href="#" className="hover:text-white">Facebook</a>
            <a href="#" className="hover:text-white">Instagram</a>
            <a href="#" className="hover:text-white">Twitter</a>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-400 text-xs mt-8">
        &copy; {new Date().getFullYear()} E-Shop. All rights reserved.
      </div>
    </footer>
  );
}
