import Navbar from "../components/Navbar";
import EventsTitle from "../components/EventsTitle";
import EventsPage from "../components/EventsPage";

export default function Events() {
    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex">
                <Navbar />
            </div>
            <div className="flex-1 overflow-auto">
                <EventsTitle />
                <div className="mt-[10px]">
                    <EventsPage />
                </div>
            </div>
        </div>
    );
}