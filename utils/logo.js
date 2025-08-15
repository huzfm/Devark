import figlet from "figlet";
import gradient from "gradient-string";
import chalkAnimation from "chalk-animation";

export async function showDevarkLogo() {
      return new Promise((resolve) => {
            console.clear();

            figlet(
                  "Devark",
                  {
                        font: "ANSI Shadow",
                        horizontalLayout: "default",
                        verticalLayout: "default",
                  },
                  (err, data) => {
                        if (err) {
                              console.log("Error creating logo");
                              resolve();
                              return;
                        }

                        // Logo gradient
                        const grayGradient = gradient(["#f8fafc", "#e2e8f0", "#94a3b8", "#64748b"]);
                        console.log(grayGradient.multiline(data));
                        console.log("");

                        // Tagline
                        const taglineGradient = gradient(["#cbd5e1", "#94a3b8"]);
                        console.log(taglineGradient(" ⚡ The fastest way to build your backend|"));

                        // Animated line

                        setTimeout(() => {
                              console.log("");
                              resolve();
                        }, 0); // increased to let animation run longer
                  }
            );
      });
}
