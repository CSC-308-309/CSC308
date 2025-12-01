// src/components/AboutCard.jsx
export default function AboutCard({ children }) {
  return (
    <div
      className="
        bg-white rounded-[20px]
        w-[250px]
        flex-shrink-0 shadow-md
        relative mx-auto
        px-2 py-1
      "
      style={{
        background: "linear-gradient(0deg, #FFF 0%, #FFF 100%), #C4C4C4",
      }}
    >
      {children}
    </div>
  );
}
