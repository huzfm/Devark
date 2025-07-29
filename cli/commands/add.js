import installOAuth from '../../packages/oauth/install.js'

export default async function add(feature) {
      const cwd = process.cwd() + '/examples/my-app'

      if (feature === 'oauth') {
            await installOAuth(cwd)
      } else {
            console.log('❌ Unsupported feature:', feature)
            console.log("and if you think that this feature should me add please conatact huzfm@proton.me")
      }
}
