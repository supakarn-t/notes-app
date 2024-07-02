import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import SearchBar from "../SearchBar/SearchBar";
import ProfileInfo from "../Cards/ProfileInfo";

export default function Navbar({ userInfo, onSearchNote, handleClearSearch }) {
	const isToken = localStorage.getItem("token");

	const [searchQuery, setSearchQuery] = useState("");

	const navigate = useNavigate();

	const onLogout = () => {
		localStorage.clear();
		navigate("/login");
	};

	const handleSearch = () => {
		if (searchQuery) {
			onSearchNote(searchQuery);
		}
	};

	const onClearSearch = () => {
		handleClearSearch();
		setSearchQuery("");
	};

	return (
		<div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow">
			<h2 className="text-xl font-medium text-black py-2">Notes</h2>

			{isToken && (
				<>
					<SearchBar
						value={searchQuery}
						onChange={({ target }) => {
							setSearchQuery(target.value);
						}}
						handleSearch={handleSearch}
						onClearSearch={onClearSearch}
					/>

					<ProfileInfo userInfo={userInfo} onLogout={onLogout} />
				</>
			)}
		</div>
	);
}

Navbar.propTypes = {
	userInfo: PropTypes.object,
	onSearchNote: PropTypes.func,
	handleClearSearch: PropTypes.func,
};
