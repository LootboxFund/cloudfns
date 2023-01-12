interface LogoSectionProps {
  backgroundColor?: string;
  logoUrls: string[];
}

const LogoSection = ({
  logoUrls,
  backgroundColor = "#191919",
}: LogoSectionProps) => {
  return (
    <div
      style={{
        alignSelf: "stretch",
        borderRadius: "0px 0px 38px 38px",
        backgroundColor: backgroundColor,
        height: "130px",
        flexShrink: "0",
        display: "flex",
        flexDirection: "row",
        padding: "20px 40px",
        boxSizing: "border-box",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "0",
      }}
    >
      <div
        style={{
          flex: "1",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        {logoUrls.slice(0, 4).map((logo, idx) => {
          return (
            <img
              key={`sponsor-logo-${idx}`}
              src={logo}
              style={{
                maxWidth: "200px",
                flex: "1",
                position: "relative",
                maxHeight: "88px",
                height: "100%",
                objectFit: "contain",
                backgroundPosition: "center",
                filter: "grayscale(100%)",
                margin: "auto",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default LogoSection;
