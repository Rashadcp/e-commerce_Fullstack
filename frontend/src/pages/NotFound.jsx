import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
            <h1 className="text-9xl font-extrabold text-[#8dc53e]">404</h1>
            <h2 className="text-3xl font-bold text-gray-800 mt-4">Page Not Found</h2>
            <p className="text-gray-600 mt-2 mb-8 text-lg">
                Oops! The page you are looking for does not exist.
            </p>
            <Link
                to="/"
                className="bg-[#8dc53e] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#76b431] transition shadow-lg"
            >
                Go Back Home
            </Link>
        </div>
    );
}

export default NotFound;
