import Navbar from '../components/Navbar';
import MessagesPanel from '../components/messages/MessagesPanel';

export default function Messages() {
  return (
    <div className="flex h-screen overflow-hidden font-sans">
      <Navbar />

      <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-melodious-pink">
          Messages
        </h1>

        <MessagesPanel />
      </div>
    </div>
  );
}
