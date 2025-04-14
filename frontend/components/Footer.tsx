import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Image
              src="/icon.png"
              alt="Desygn icon"
              width={30}
              height={30}
              className="w-7 h-7"
            />
            <span className="text-xl font-bold">Desygn</span>
          </div>
          <div className="mt-4 md:mt-0 text-white/60">
            © {new Date().getFullYear()} Desygn. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
