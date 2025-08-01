import type { Preview } from "@storybook/react";
import "../styles/globals.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: "#ffffff",
        },
        {
          name: "dark",
          value: "#1a1a1a",
        },
        {
          name: "industrial",
          value: "#f5f5f5",
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: "Mobile",
          styles: {
            width: "375px",
            height: "667px",
          },
        },
        tablet: {
          name: "Tablet",
          styles: {
            width: "768px",
            height: "1024px",
          },
        },
        desktop: {
          name: "Desktop",
          styles: {
            width: "1440px",
            height: "900px",
          },
        },
        wide: {
          name: "Wide",
          styles: {
            width: "1920px",
            height: "1080px",
          },
        },
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: true,
          },
          {
            id: "button-name",
            enabled: true,
          },
          {
            id: "image-alt",
            enabled: true,
          },
        ],
      },
    },
    docs: {
      toc: true,
      source: {
        state: "open",
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
    direction: {
      description: "Text direction",
      defaultValue: "ltr",
      toolbar: {
        title: "Direction",
        icon: "arrowleft",
        items: ["ltr", "rtl"],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme;
      const direction = context.globals.direction;
      
      return (
        <div 
          className={`${theme} ${direction}`}
          style={{ 
            direction: direction as "ltr" | "rtl",
            minHeight: "100vh",
            padding: "1rem"
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview; 