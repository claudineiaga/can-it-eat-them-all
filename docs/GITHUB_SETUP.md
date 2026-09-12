# Publish on GitHub

Suggested repository name: **can-it-eat-them-all**

Suggested repository description:

> A growing eater takes on a multiplying swarm. An interactive JavaScript simulation with synchronized sound and a Python/FFmpeg video export pipeline.

Suggested topics:

`javascript`, `canvas`, `simulation`, `creative-coding`, `generative-art`, `satisfying`, `animation`, `web-audio`, `python`

## Upload the project

1. Extract the ZIP. Open the `can-it-eat-them-all` folder.
2. Create a repository on GitHub, or open the repository you want to use.
3. Upload the **contents** of this folder so `README.md`, `index.html`, and `package.json` appear at the repository root. Do not upload only the ZIP or place the entire project inside an extra parent folder.
4. In an existing repository, use **Add file → Upload files**. Drag the files and folders into the upload area and commit the changes. On an empty repository, use its upload-files link.
5. Suggested commit message: **Add Can It Eat Them All simulation and English publishing package**.

The included MP4 is about 9 MB, within GitHub's 25 MiB per-file browser-upload limit. It is optional for the live simulation; `index.html` runs without it. Keep it if you want the README's video link to work.

You can also copy the contents into a local clone and commit with Git:

```sh
git add .
git commit -m "Add Can It Eat Them All simulation and English publishing package"
git push
```

These commands assume you are inside your cloned repository and its upstream branch is already configured.

## Enable the interactive site

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose the branch containing the project, usually **main**.
4. Choose **/(root)** as the publishing folder, then save.
5. Wait for the deployment to finish and open the URL shown in Pages settings.

No build command, backend, or secret is required. The ready-built `index.html` is the entry point. A `.nojekyll` file is included for plain static hosting. If you upload through a file picker, ensure it includes the project's dotfiles as well.

The live URL will normally follow this pattern: `https://YOUR-USERNAME.github.io/can-it-eat-them-all/`. Use the actual URL shown by GitHub rather than posting this placeholder.

After deployment, check Play, sound, Restart, the timeline, and the mobile layout in your browser. Add the real live URL to the repository's About section and the source-code URL to your video description or pinned comment.

## Update the site

Edit the source, run `python scripts/build-html.py`, and commit the changed sources **and** the rebuilt `index.html`. The Pages deployment will use the updated file.

## Official instructions

- [Adding a file to a repository](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [Configuring a publishing source for GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
