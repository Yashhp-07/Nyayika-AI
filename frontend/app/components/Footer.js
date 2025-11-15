export default function Footer() {
  // Indian Legal Color Palette - matching HeroHome component
  const PRIMARY_COLORS = {
    justiceNavy: "#1B365D", // Deep navy blue - represents authority and trust
    saffronGold: "#FF9933", // Indian saffron - national flag color, represents courage
  };

  const SECONDARY_COLORS = {
    ashokGreen: "#138808", // Indian flag green - represents faith and chivalry
    constitutionMaroon: "#800020", // Deep maroon - represents dignity and law
    parchmentCream: "#F5F5DC", // Legal document background
    charcoalGray: "#36454F", // Professional text color
  };

  const students = [
    {
      name: "Honey Arora",
      url: "https://www.linkedin.com/in/honey-arora-288783273/",
    },
    {
      name: "Yash Patel",
      url: "https://www.linkedin.com/in/yash-patel-34a890365/",
    },
    {
      name: "Shubham Patel",
      url: "https://www.linkedin.com/in/shubham-patel-506a79270/",
    },
  ];

  const quote =
    "Built to protect people from legal document scams — in service of human welfare, dignity, and justice.";

  return (
    <footer
      className="text-white p-6 text-center border-t-4"
      style={{
        backgroundColor: PRIMARY_COLORS.justiceNavy,
        borderTopColor: PRIMARY_COLORS.saffronGold,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-lg font-medium">
          &copy; {new Date().getFullYear()} Nyayika AI. All rights reserved.
        </div>
        <div
          className="mt-3 text-base italic leading-relaxed"
          style={{ color: SECONDARY_COLORS.parchmentCream }}
        >
          {quote}
        </div>
        <div className="mt-4 flex justify-center space-x-6">
          {students.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-colors duration-300 hover:underline"
              style={{
                color: PRIMARY_COLORS.saffronGold,
                textDecorationColor: PRIMARY_COLORS.saffronGold,
              }}
              aria-label={`LinkedIn profile of ${s.name}`}
            >
              {s.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
