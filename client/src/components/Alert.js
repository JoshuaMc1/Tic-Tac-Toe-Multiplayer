const Alert = ({ display, message }) => {
    return (
        <div
            className={`${display ? "block mb-6 py-2 px-4" : "hidden"
                } bg-red-500 text-white font-bold rounded-lg transition-colors hover:bg-red-700`}
        >
            {message}
        </div>
    )
}

export default Alert