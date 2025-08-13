import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

function BackButton({ destination, defaultText = "Volver", className = "" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (destination) {
      navigate(destination);
    } else {
      navigate(-1); // Navega a la página anterior
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center text-blue-600 hover:text-blue-800 transition-colors ${className}`}
      aria-label={destination ? `Volver a ${destination}` : "Volver atrás"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
      {defaultText}
    </button>
  );
}

BackButton.propTypes = {
  destination: PropTypes.string,
  defaultText: PropTypes.string,
  className: PropTypes.string,
};

export default BackButton;
