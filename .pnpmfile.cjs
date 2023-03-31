//-------------------------------- START CONFIG --------------------------------

// dependencies to auto-inject to detected Neighbourhoods UI components
const NH_DEPS = [
  "@neighbourhoods/sensemaker-lite-types",
  "lit-svelte-stores",
]

// dependencies to auto-inject to detected Valueflows UI components
const VF_DEPS = [
  "@apollo-elements/core",
  "@valueflows/vf-graphql",
  "graphql-tag",
]

// dependencies to auto-inject to all detected LitElements
const LIT_DEPS = [
  "@lit-labs/scoped-registry-mixin",
  "lit",
]

// Specifies packages that should be pinned to the versions defined in the workspace manifest.
const PINNED_DEPS = [
  ...NH_DEPS, ...VF_DEPS, ...LIT_DEPS,
]

// Specifies deprecated packages and their preferred replacements.
// The replacement package must be defined in `PINNED_DEPS` and the `devDependencies` of the workspace.
const DISALLOW_PKGS = {
  "@open-wc/scoped-elements": "@lit-labs/scoped-registry-mixin",
}

//--------------------------------- END CONFIG ---------------------------------

const path = require('path')
const fs = require('fs')
const topLevelPkg = require('./package.json')
const topLevelNamespace = (topLevelPkg.name.match(/^\@(\w+)\//) || [])[1]
if (!topLevelNamespace) throw new Error("Project configuration error: Your top-level `package.json` should specify an organisation namespace.")
const projectNamespaces = [topLevelNamespace, ...(topLevelPkg.additionalProjectNamespaces || [])]

const pinnedPkgs = Object.keys(topLevelPkg.devDependencies)
  .filter(key => PINNED_DEPS.includes(key))
  .reduce((obj, key) => {
    obj[key] = topLevelPkg.devDependencies[key]
    return obj
  }, {})

const dependencyInjector = (deps, depsType) => (pkg, context) => {
  pkg.dependencies = Object.keys(pkg.dependencies)
    .filter(key => deps.includes(key) && pinnedPkgs[key] !== undefined)
    .reduce((obj, key) => {
      obj[key] = pinnedPkgs[key];
      return obj;
    }, pkg.dependencies)

  context.log(`${pkg.name}: injected ${depsType} build deps`)
}

const injectLitBuildDeps = dependencyInjector(LIT_DEPS, 'Lit')
const injectNHBuildDeps = dependencyInjector(NH_DEPS, 'Neighbourhoods')
const injectVFBuildDeps = dependencyInjector(VF_DEPS, 'Valueflows')

function readPackage(pkg, context) {
  // ignore private workspace metadata packages
  if (pkg.private) return pkg
  // ignore packages not part of project
  if (projectNamespaces.filter(ns => pkg.name.match(new RegExp(`^\@${ns}\/`))).length === 0) return pkg
  // enforce license
  if (pkg.license !== 'Apache-2.0') {
    pkg.license = 'Apache-2.0'
  }

  // determine package type based on key dependencies & assign core deps
  if (pkg.dependencies["lit"]) {
    injectLitBuildDeps(pkg, context)
    if (pkg.dependencies["lit-svelte-stores"] && pkg.dependencies["@neighbourhoods/sensemaker-lite-types"]) injectNHBuildDeps(pkg, context)
    if (Object.keys(pkg.dependencies).filter(d => d.match(/^\@valueflows\//)).length > 0) injectVFBuildDeps(pkg, context)
  }

  // force any present modules with pinned versions to match those specified in the workspace
  for (const pinnedPkg in pinnedPkgs) {
    if (pkg.dependencies[pinnedPkg]) pkg.dependencies[pinnedPkg] = pinnedPkgs[pinnedPkg]
    if (pkg.devDependencies[pinnedPkg]) pkg.devDependencies[pinnedPkg] = pinnedPkgs[pinnedPkg]
  }

  // remove any disallowed packages and replace with their alternates
  for (const disallowPkg in DISALLOW_PKGS) {
    if (pkg.dependencies[disallowPkg]) {
      delete pkg.dependencies[disallowPkg]
      pkg.dependencies[DISALLOW_PKGS[disallowPkg]] = pinnedPkgs[DISALLOW_PKGS[disallowPkg]]
    }
    if (pkg.devDependencies[disallowPkg]) {
      delete pkg.devDependencies[disallowPkg]
      pkg.devDependencies[DISALLOW_PKGS[disallowPkg]] = pinnedPkgs[DISALLOW_PKGS[disallowPkg]]
    }
  }

  return pkg
}

// persist any package dependency updates to filesystem for modules processed within the `ui/` directory
async function afterAllResolved(lockfile, context) {
  const resolvedPkgs = lockfile.importers
  Object.keys(resolvedPkgs).filter(p => p.match(/^ui\//)).forEach(relPkgPath => {
    const pkgPath = path.resolve(relPkgPath, './package.json')
    const projectPkg = require(pkgPath)

    projectPkg.dependencies = resolvedPkgs[relPkgPath].specifiers
    projectPkg.devDependencies = resolvedPkgs[relPkgPath].devDependencies

    fs.writeFileSync(pkgPath, JSON.stringify(projectPkg, undefined, 2))
  })
  return lockfile
}

module.exports = {
  hooks: {
    readPackage,
    afterAllResolved,
  }
}
