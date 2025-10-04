import figlet from 'figlet';
import gradient from 'gradient-string';

export async function showDevarkLogo() {
  return new Promise<void>((resolve) => {
  try {
    console.clear();

    figlet(
      'Devark',
      {
    font: 'Standard', // Use a more reliable font
    horizontalLayout: 'default',
    verticalLayout: 'default',
      },
      (err, data) => {
    if (err) {
      // Fallback to simple text logo
      console.log('🚀 Devark');
      console.log('⚡ The fastest way to build your backend');
      console.log('');
      resolve();
      return;
    }

    try {
      // Logo gradient
      const grayGradient = gradient([
        '#f8fafc',
        '#e2e8f0',
        '#94a3b8',
        '#64748b',
      ]);
      console.log(grayGradient.multiline(data || ''));
      console.log('');

      // Tagline
      const taglineGradient = gradient([
        '#cbd5e1',
        '#94a3b8',
      ]);
      console.log(
        taglineGradient(
          ' ⚡ The fastest way to build your backend |',
        ),
      );

      // Animated line
      setTimeout(() => {
        console.log('');
        resolve();
      }, 0);
    } catch (gradientErr) {
      // Fallback if gradient fails
      console.log(data || '');
      console.log('⚡ The fastest way to build your backend');
      console.log('');
      resolve();
    }
      },
    );
  } catch (error) {
    // Ultimate fallback
    console.log('🚀 Devark');
    console.log('⚡ The fastest way to build your backend');
    console.log('');
    resolve();
  }
  });
}
