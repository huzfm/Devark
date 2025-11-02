import figlet from "figlet";
import gradient from "gradient-string";

export async function showDevarkLogo() {
      return new Promise((resolve) => {
            console.clear();

            figlet(
                  "DevArk",
                  {
                        font: "Standard",
                        horizontalLayout: "default",
                        verticalLayout: "default",
                  },
                  (err, data) => {
                        if (err || !data) {
                              console.log("DevArk");
                              return resolve();
                        }

                        try {
                              const logoGradient = gradient("#000")
                              console.log(logoGradient.multiline(data));
                              console.log(""); // blank line for spacing
                        } catch {
                              console.log(data);
                              console.log("");
                        }

                        resolve();
                  }
            );
      });
}
