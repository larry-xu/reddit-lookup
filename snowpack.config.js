module.exports = {
  buildOptions: {
    metaUrlPath: "snowpack",
  },
  mount: {
    src: "/",
  },
  plugins: ["@snowpack/plugin-typescript"],
};
