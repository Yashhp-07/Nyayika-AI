import Image from "next/image";
import FileUpload from "./components/FileUpload";
import HeroHome from "./components/HeroHome";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <HeroHome />
      <div className="flex min-h-screen items-center justify-center">
        <FileUpload />
      </div>
    </div>
  );
}
