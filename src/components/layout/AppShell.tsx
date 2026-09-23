import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

export function AppShell() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0F1E]">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 py-4 w-full max-w-3xl mx-auto animate-in">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
