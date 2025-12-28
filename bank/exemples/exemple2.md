# HTML
<div id="app"></di

# SCSS
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap");

$primary-color: #a05d34;
$border-color: #d1a878;
$card-bg: #fdf3d7;
$font-family: "Cormorant Garamond";
$text-color: #4a4a4a;
$card-position: right;

:root {
  --primary-color: #{$primary-color};
  --border-color: #{$border-color};
  --card-bg: #{$card-bg};
  --font-family: #{$font-family};
  --text-color: #{$text-color};
  --card-position: #{$card-position};
}

@mixin position-card($position) {
  @if $position == left {
    left: 0;
  } @else if $position == right {
    right: 0;
  }
}

body {
  font-size: 18px;
  font-family: #{$font-family}, serif;
}

#scroll {
  position: relative;
  padding-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  .scroll__graphic {
    top: 0;
  }

  .scroll__text {
    position: absolute;
    width: 100%;
    padding: 1rem;
    max-width: 40rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    @include position-card($card-position);
  }
}

.step {
  background-color: $card-bg;
  box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.2);
  border: 1px solid $border-color;
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.3s ease;
  background-image: url("https://assets.codepen.io/252820/soft-wallpaper.png");
  background-size: cover;
  position: relative;

  &:hover {
    transform: translateY(-4px);
  }

  h3 {
    font-size: 1.25em;
    color: $primary-color;
    filter: brightness(0.6);
    margin-bottom: 0.5rem;
  }

  h4 {
    font-size: 1.1em;
    font-weight: 600;
    color: $primary-color;
    filter: brightness(0.7);
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1em;
    color: $text-color;
    line-height: 1.6;
    margin-bottom: 1rem;
    font-family: #{$font-family}, serif;
  }

  img {
    width: 100%;
    height: auto;
    border-radius: 0.375rem;
    margin-top: 1rem;
    border: 1px solid $border-color;
  }

  &::before {
    font-family: Arial, Helvetica, sans-serif;
    content: attr(data-step);
    font-size: 1.2em;
    width: 36px;
    height: 36px;
    background-color: $primary-color;
    color: white;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: top;
    position: absolute;
    right: 10px;
    top: 10px;
  }
}

.overlay {
  background: rgba(255, 255, 255, 0.35);
}

#map {
  z-index: -1;
  width: 100vw;
  height: 100vh;
}

@media (max-width: 768px) {
  .scroll__text {
    width: 100%;
    padding: 1rem;
  }

  .step {
    padding: 1rem;
  }

  body {
    font-size: 16px;
  }
}

// Map Marker Dot Styling
.number-icon {
  background: $primary-color;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

# Badel
// data for the waypoints on the map, and the step cards
const waypointsData = [
  {
    title: "Starting Point: St. Louis, Missouri",
    year: "May 14, 1804",
    description:
      "Lewis and Clark officially began their expedition from Camp Dubois, just outside of St. Louis. They set off up the Missouri River, intending to map the vast uncharted western territories and find a navigable water route to the Pacific. The journey was funded by President Thomas Jefferson following the Louisiana Purchase, with the goal of expanding American knowledge and influence over these new lands. This launch marked the beginning of a two-year expedition that would cover over 8,000 miles.",
    location: { lat: 38.627, lng: -90.1994 },
    photo:
      "https://assets.codepen.io/252820/starting-point.jpeg?width=500&format=auto"
  },
  {
    title: "First Winter: Fort Mandan, North Dakota",
    year: "Winter of 1804-1805",
    description:
      "As winter approached, the Corps of Discovery built Fort Mandan along the Missouri River to endure the harsh North Dakota winter. Here, they made contact with the local Mandan and Hidatsa tribes, trading supplies and learning about the geography and wildlife of the surrounding lands. They also met Sacagawea, a young Shoshone woman, and her husband, Toussaint Charbonneau, who would soon join the expedition. Sacagawea’s knowledge of the land and ability to communicate with other tribes became invaluable to the success of their journey.",
    location: { lat: 47.3211, lng: -101.3358 },
    photo:
      "https://assets.codepen.io/252820/fort-mandan.jpg?width=500&format=auto"
  },
  {
    title: "Great Falls, Montana",
    year: "June 13, 1805",
    description:
      "Arriving at the Great Falls of the Missouri River, the Corps encountered one of their greatest physical challenges. The falls were a series of five cascades that stretched over 18 miles, requiring the explorers to portage their boats and supplies around the obstacles. This grueling task took nearly a month to complete, as they carried their gear across rugged terrain, battling injury, exhaustion, and unpredictable weather. The Great Falls marked a pivotal moment, testing the endurance and resolve of the Corps.",
    location: { lat: 47.5049, lng: -111.2919 },
    photo:
      "https://assets.codepen.io/252820/great-falls.jpg?width=500&format=auto"
  },
  {
    title: "Crossing the Continental Divide: Lemhi Pass",
    year: "August 12, 1805",
    description:
      "At Lemhi Pass, Lewis and a small scouting party crossed the Continental Divide, marking the transition from the Missouri River watershed to the Columbia River watershed. Here, they realized that there was no continuous water route to the Pacific, which challenged one of the primary hopes of the expedition. Nevertheless, they pressed on, relying on the guidance of Sacagawea’s Shoshone tribe, who provided them with horses and knowledge of the mountain passes. This moment symbolized the vast, rugged terrain they would continue to face.",
    location: { lat: 45.107, lng: -113.3666 },
    photo:
      "https://assets.codepen.io/252820/lemhi-pass.jpg?width=500&format=auto"
  },
  {
    title: "Pacific Winter: Fort Clatsop, Oregon",
    year: "Winter of 1805-1806",
    description:
      "Reaching the Pacific Ocean, the Corps of Discovery established Fort Clatsop near present-day Astoria, Oregon, where they would spend a long, damp winter. Facing constant rain, limited food supplies, and illness, morale was low, but the men worked diligently to document their findings, prepare new maps, and record their interactions with local tribes. The months at Fort Clatsop allowed them to rest and gather strength before the journey back east, while reflecting on the vast landscapes and rich cultures they had encountered.",
    location: { lat: 46.1342, lng: -123.229 },
    photo:
      "https://assets.codepen.io/252820/fort-clatsop.jpg?width=500&format=auto"
  },
  {
    title: "Columbia River, Oregon/Washington Border",
    year: "November 15, 1805",
    description:
      "The Corps of Discovery reached the mouth of the Columbia River on November 15, 1805, marking the westernmost point of their expedition. This moment symbolized the fulfillment of their mission to reach the Pacific Ocean. Standing on the shores of the Pacific, they celebrated this monumental achievement, knowing that they had successfully mapped a route across the continent. The journey, however, was far from over, as they would soon face the challenge of returning home with their newfound knowledge and records.",
    location: { lat: 46.1157, lng: -124.1044 },
    photo:
      "https://assets.codepen.io/252820/columbia-river.webp?width=500&format=auto"
  }
];

const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--primary-color")
  .trim();

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const { useEffect, useRef, useState } = React;

function App() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const map = L.map(mapRef.current, { zoomControl: false }).setView(
      [waypointsData[0].location.lat, waypointsData[0].location.lng],
      6
    );
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);

    const latlngs = waypointsData.map((point) => [
      point.location.lat,
      point.location.lng
    ]);
    L.polyline(latlngs, { color: primaryColor, dashArray: "12 12" }).addTo(map);

    waypointsData.forEach((waypoint, index) => {
      const numberIcon = L.divIcon({
        className: "number-icon",
        html: `<div>${index + 1}</div>`,
        iconSize: [24, 24]
      });
      L.marker([waypoint.location.lat, waypoint.location.lng], {
        icon: numberIcon
      })
        .bindPopup(
          `<strong>${waypoint.title}</strong><br>${waypoint.description}`
        )
        .addTo(map);
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && activeStep != null) {
      const { lat, lng } = waypointsData[activeStep].location;
      mapInstanceRef.current.panTo([lat, lng], {
        animate: !prefersReducedMotion,
        duration: prefersReducedMotion ? 0 : 2
      });
    }
  }, [activeStep]);

  useEffect(() => {
    const scroller = scrollama();
    scroller.setup({ step: ".step", offset: 0.5 }).onStepEnter((e) => {
      const stepIndex = parseInt(e.element.getAttribute("data-step")) - 1;
      setActiveStep(stepIndex);
    });

    return () => scroller.destroy();
  }, []);

  useEffect(() => {
    const handleKeyNavigation = (event) => {
      const maxStep = waypointsData.length - 1;

      if (["ArrowUp", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        return;
      }

      if (event.key >= "1" && event.key <= `${waypointsData.length}`) {
        const stepIndex = parseInt(event.key) - 1;
        const stepElement = document.querySelector(
          `.step[data-step="${stepIndex + 1}"]`
        );
        if (stepElement) {
          stepElement.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "center"
          });
          stepElement.focus();
        }
      } else if (event.key === "Escape") {
        const firstStep = document.querySelector(`.step[data-step="1"]`);
        if (firstStep) {
          firstStep.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "center"
          });
        }
      } else if (event.key === "ArrowLeft" && activeStep > 0) {
        const prevElement = document.querySelector(
          `.step[data-step="${activeStep}"]`
        );
        if (prevElement) {
          prevElement.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "center"
          });
        }
      } else if (event.key === "ArrowRight" && activeStep < maxStep) {
        const nextElement = document.querySelector(
          `.step[data-step="${activeStep + 2}"]`
        );
        if (nextElement) {
          nextElement.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "center"
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyNavigation);
    return () => window.removeEventListener("keydown", handleKeyNavigation);
  }, [activeStep, prefersReducedMotion]);

  return (
    <div id="scroll" className="flex flex-col">
       <AppModal />
      <div className="scroll__graphic fixed w-full">
        <div className="overlay">
          <div className="chart" id="map" ref={mapRef}></div>
        </div>
      </div>
      <div className="scroll__text flex flex-col items-center space-y-8 w-full md:w-1/2">
        {waypointsData.map((waypoint, index) => (
          <StepCard key={index} data={waypoint} step={index + 1} />
        ))}
      </div>
    </div>
  );
}

function StepCard({ data, step }) {
  return (
    <div
      className="step card shadow-lg rounded-lg overflow-hidden border p-4"
      data-step={step}
    >
      <h3 className="text-xl font-bold mb-2 text-indigo-700">{data.year}</h3>
      <h4 className="text-lg font-semibold mb-2">{data.title}</h4>
      <p className="text-gray-700 mb-4">{data.description}</p>
      <img
        src={data.photo}
        alt={data.title}
        className="w-full h-auto rounded-md"
      />
    </div>
  );
}

function AppModal() {
   const [isOpen, setIsOpen] = useState(true);

  return (
    isOpen && (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Explore the Lewis and Clark Expedition</h2>
          <p className="mb-4">
            This interactive map showcases the journey of Lewis and Clark using animations and
            step-based navigation. Use your left and right arrow keys, the matching number keys or simply scroll up and down to explore different parts of the expedition.
          </p>
          <p className="mb-4">
            <b>Accessibility:</b> Animations adjust based on your system's reduced motion settings.
          </p>
          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 bg-green-800 text-white px-4 py-2 rounded"
          >
            Got it!
          </button>
        </div>
      </div>
    )
  ); 
}

ReactDOM.render(<App />, document.getElementById("app"));
