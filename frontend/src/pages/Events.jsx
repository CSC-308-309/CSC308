import Navbar from "../components/Navbar";
import EventsTitle from "../components/EventsTitle";
import EventsPage from "../components/EventsPage";

export default function Events() {
    return (
        <div className="flex h-screen">
            <Navbar />

            <div className="flex flex-col flex-1">
                <EventsTitle />
                <div className="flex-1 overflow-y-auto">
                    <EventsPage />
                </div>
            </div>
        </div>

    );
}