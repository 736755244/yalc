import { exec, execSync } from 'child_process'
import * as fs from 'fs-extra'
import * as path from 'path'
import { copyPackageToStore } from './copy'
import {
  PackageInstallation, InstallationsFile,
  readInstallationsFile,
  addInstallations,
  removeInstallations,
  PackageName
} from './installations'

import {
  readLockfile,
  addPackageToLockfile,
} from './lockfile'

import {
  values, PackageManifest,
  execLoudOptions,
  getPackageManager,
  updatePackages,
  readPackageManifest,
  writePackageManifest,
  getStorePackagesDir
} from '.'
export interface PublishPackageOptions {
  workingDir: string,
  signature?: boolean,
  knit?: boolean
  force?: boolean
  push?: boolean,
  pushSafe?: boolean
}

const { join } = path

export const publishPackage = async (options: PublishPackageOptions) => {
  const workingDir = options.workingDir
  const pkg = readPackageManifest(workingDir)
  if (!pkg) {
    return
  }

  const changeDirCmd = 'cd ' + options.workingDir + ' && '
  const scriptRunCmd = !options.force && pkg.scripts
    ? changeDirCmd + getPackageManager(workingDir) + ' run ' : ''

  if (scriptRunCmd) {
    if (pkg.scripts!.preyalc) {
      console.log('Running preloc script: ' + pkg.scripts!.preyalc)
      execSync(scriptRunCmd + values.prescript, execLoudOptions)
    } else if (pkg.scripts!.prepublish) {
      console.log('Running prepublish script: ' + pkg.scripts!.prepublish)
      execSync(scriptRunCmd + 'prepublish', execLoudOptions)
    }
  }

  const signature = await copyPackageToStore(pkg, options)

  if (scriptRunCmd) {
    if (pkg.scripts!.postyalc) {
      console.log('Running postloc script: ' + pkg.scripts!.postyalc)
      execSync(scriptRunCmd + values.postscript, execLoudOptions)
    } else if (pkg.scripts!.postpublish) {
      console.log('Running pospublish script: ' + pkg.scripts!.postpublish)
      execSync(scriptRunCmd + 'postpublish', execLoudOptions)
    }
  }

  if (options.push || options.pushSafe) {
    const installationsConfig = readInstallationsFile()
    const installationPaths =
      installationsConfig[pkg.name] || []
    const installationsToRemove: PackageInstallation[] = []
    installationPaths.forEach((workingDir) => {
      console.log(`Pushing ${pkg.name}@${pkg.version} in ${workingDir}`)
      installationsToRemove.concat(
        updatePackages([pkg.name], { workingDir, noInstallationsRemove: true })
      )
    })
    removeInstallations(installationsToRemove)
  }
  // workaround yarn bug with file: deps
  try {
    const yarnCacheDir = execSync('yarn cache dir').toString().trim()
    const cachedVersionPath =
      join(yarnCacheDir, ['npm', pkg.name, pkg.version].join('-'))
    fs.removeSync(cachedVersionPath)
  } catch (e) { }  
  const publishedPackageDir = join(getStorePackagesDir(), pkg.name, pkg.version)
  const publishedPkg = readPackageManifest(publishedPackageDir)!
  console.log(`${publishedPkg.name}@${publishedPkg.version} published in store.`)
}
