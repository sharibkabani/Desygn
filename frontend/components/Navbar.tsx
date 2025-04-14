import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between py-6">
      <div className="flex items-center gap-2">
        <Image
          src="/icon.png"
          alt="Desygn icon"
          width={40}
          height={40}
          className="w-10 h-10"
        />
        <span className="text-2xl font-bold">Desygn</span>
      </div>
      <Button variant="ghost" asChild>
        <Link href="/login">Login</Link>
      </Button>
    </nav>
  );
}
