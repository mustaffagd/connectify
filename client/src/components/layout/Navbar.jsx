import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <MessageCircle className="h-7 w-7 text-violet-500" />
          <span className="text-xl font-bold text-white">Connectify</span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <Avatar
                  src={user?.profile_image}
                  username={user?.username}
                  size="sm"
                />
                <span className="text-sm font-medium text-gray-200">
                  {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-800 bg-gray-950 px-4 pb-4 pt-2 md:hidden">
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-2 py-2">
                <Avatar
                  src={user?.profile_image}
                  username={user?.username}
                  size="sm"
                />
                <span className="text-sm font-medium text-gray-200">
                  {user?.username}
                </span>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-violet-600 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-violet-500"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
