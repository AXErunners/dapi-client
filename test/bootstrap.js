const { expect, use } = require('chai');
const dirtyChai = require('dirty-chai');
const chaiAsPromised = require('chai-as-promised');
const AxeApiOptions = require('@axerunners/js-evo-services-ctl/lib/services/driveApi/DriveApiOptions');
const AxeSyncOptions = require('@axerunners/js-evo-services-ctl/lib/services/driveSync/DriveSyncOptions');
const DapiOptions = require('@axerunners/js-evo-services-ctl/lib/services/dapi/DapiOptions');
const AxeCoreOptions = require('@axerunners/js-evo-services-ctl/lib/services/axeCore/AxeCoreOptions');
const InsightOptions = require('@axerunners/js-evo-services-ctl/lib/services/insight/InsightOptions');

use(chaiAsPromised);
use(dirtyChai);

if (process.env.SERVICE_IMAGE_CORE) {
    AxeCoreOptions.setDefaultCustomOptions({
        container: {
            image: process.env.SERVICE_IMAGE_CORE,
        },
    });
}

if (process.env.SERVICE_IMAGE_DAPI) {
    DapiOptions.setDefaultCustomOptions({
        container: {
            image: process.env.SERVICE_IMAGE_DAPI,
        },
    });
}

if (process.env.SERVICE_IMAGE_INSIGHT) {
    InsightOptions.setDefaultCustomOptions({
        container: {
            image: process.env.SERVICE_IMAGE_INSIGHT,
        },
    });
}

if (process.env.SERVICE_IMAGE_DRIVE) {
     AxeApiOptions.setDefaultCustomOptions({
        container: {
            image: process.env.SERVICE_IMAGE_DRIVE,
        },
    });
}

if (process.env.SERVICE_IMAGE_DRIVE) {
    AxeSyncOptions.setDefaultCustomOptions({
        container: {
            image: process.env.SERVICE_IMAGE_DRIVE,
        },
    });
}


global.expect = expect;
