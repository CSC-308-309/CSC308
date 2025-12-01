// src/components/YouMightKnowCard.jsx
export default function YouMightKnowCard({ children }) {
  return (
    <div
      className="
        bg-white rounded-[20px]
        w-[250px] h-[500px]
        flex-shrink-0 shadow-md
        relative mx-auto pt-[0.5px]
      "
      style={{
        background: "linear-gradient(0deg, #FFF 0%, #FFF 100%), #C4C4C4",
      }}
    >
      {children}
    </div>
  );
}
