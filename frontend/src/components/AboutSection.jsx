// src/components/AboutSection.jsx
import StarIcon from "../assets/TopInterestsIcon.png";
import UserMusicIcon from "../assets/TopArtistIcon.png";
import MusicNoteIcon from "../assets/favoriteGenresIcon.png";
import PlaylistIcon from "../assets/PlaylistLinkIcon.png";
import LocationIcon from "../assets/MeetupLocationsIcon.png";
import ClockIcon from "../assets/AvailabilityIcon.png";

export default function AboutSection({ profileData = {} }) {
  const {
    topInterests = "",
    favoriteArtists = "",
    favoriteGenres = "",
    playlistLink = "",
    meetupLocations = "",
    availability = "",
  } = profileData || {};

  const makeChips = (value) =>
    value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const interestChips = makeChips(topInterests);
  const artistChips = makeChips(favoriteArtists);
  const genreChips = makeChips(favoriteGenres);

  const renderPlaylistValue = () => {
    if (!playlistLink) {
      return (
        <span className="text-sm text-gray-400">Add a playlist link</span>
      );
    }

    const label =
      playlistLink.length > 40
        ? playlistLink.slice(0, 37) + "..."
        : playlistLink;

    return (
      <a
        href={playlistLink}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-[#7E3AF2] underline break-all"
      >
        {label}
      </a>
    );
  };

  const renderChipRow = (chips, emptyText) =>
    chips.length > 0 ? (
      <div className="mt-2 flex flex-wrap gap-2">
        {chips.map((text) => (
          <span
            key={text}
            className="px-3 py-1 rounded-full bg-[#7E3AF2]/10 text-[#7E3AF2] text-xs font-medium"
          >
            {text}
          </span>
        ))}
      </div>
    ) : (
      <p className="mt-1 text-sm text-gray-400">{emptyText}</p>
    );

  const Row = ({ icon, label, children }) => (
    <div className="py-3 flex items-start">
      <div className="mt-0.5 w-7 flex justify-center">
        {icon}
      </div>
      <div className="flex-1 ml-3">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {children}
      </div>
    </div>
  );

  return (
    <section aria-label="About information">
      <h3 className="text-lg font-semibold text-[#7E3AF2] mb-1">About</h3>

      <div className="divide-y divide-gray-100">
        <Row
          icon={<img src={StarIcon} alt="" className="w-6 h-6" />}
          label="Top Interests"
        >
          {renderChipRow(
            interestChips,
            "Add interests (comma-separated)."
          )}
        </Row>

        <Row
          icon={<img src={UserMusicIcon} alt="" className="w-4 h-4" />}
          label="Favorite/Top Artist(s)"
        >
          {renderChipRow(
            artistChips,
            "Add your favorite artists (comma-separated)."
          )}
        </Row>

        <Row
          icon={<img src={MusicNoteIcon} alt="" className="w-6 h-6" />}
          label="Fav Music Genres"
        >
          {renderChipRow(
            genreChips,
            "Add your favorite genres (comma-separated)."
          )}
        </Row>

        <Row
          icon={<img src={PlaylistIcon} alt="" className="w-6 h-6" />}
          label="Apple/Spotify playlist"
        >
          <div className="mt-1">{renderPlaylistValue()}</div>
        </Row>

        <Row
          icon={<img src={LocationIcon} alt="" className="w-5 h-6" />}
          label="Meetup Locations"
        >
          <div className="mt-1">
            {meetupLocations ? (
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {meetupLocations}
              </p>
            ) : (
              <span className="text-sm text-gray-400">
                Add neighborhoods, venues, or cities
              </span>
            )}
          </div>
        </Row>

        <Row
          icon={<img src={ClockIcon} alt="" className="w-5 h-5" />}
          label="Availability"
        >
          <div className="mt-1">
            {availability ? (
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {availability}
              </p>
            ) : (
              <span className="text-sm text-gray-400">
                Add days and times you&apos;re free.
              </span>
            )}
          </div>
        </Row>
      </div>
    </section>
  );
}
