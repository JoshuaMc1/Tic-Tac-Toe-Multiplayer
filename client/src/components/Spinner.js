const Spinner = ({ text = "Cargando..." }) => {
    return (
        <div className="flex h-full justify-center items-center flex-col">
            <div className="sk-chase">
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
            </div>
            <span className="text-xl mt-2 text-white font-bold text-center">
                {text}
            </span>
        </div>
    );
};

export default Spinner;