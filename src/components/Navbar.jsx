import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="p-4 bg-gray-200">
      <Link to="/" className="mr-4">
        Inicio
      </Link>
      <Link to="/cart">Ver carrito</Link>
    </nav>
  );
}

export default Navbar;
