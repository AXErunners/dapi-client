const { expect, use } = require('chai');
const dirtyChai = require('dirty-chai');
const chaiAsPromised = require('chai-as-promised');
const AxeApiOptions = require('@axerunners/dp-services-ctl/lib/services/driveApi/DriveApiOptions');
const AxeSyncOptions = require('@axerunners/dp-services-ctl/lib/services/driveSync/DriveSyncOptions');
const DapiCoreOptions = require('@axerunners/dp-services-ctl/lib/services/dapi/core/DapiCoreOptions');
const DapiTxFilterStreamOptions = require('@axerunners/dp-services-ctl/lib/services/dapi/txFilterStream/DapiTxFilterStreamOptions');
const AxeCoreOptions = require('@axerunners/dp-services-ctl/lib/services/axeCore/AxeCoreOptions');
const InsightApiOptions = require('@axerunners/dp-services-ctl/lib/services/insightApi/InsightApiOptions');

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
    DapiCoreOptions.setDefaultCustomOptions({
        container: {
            image: process.env.SERVICE_IMAGE_DAPI,
        },
    });
    DapiTxFilterStreamOptions.setDefaultCustomOptions({
        container: {
            image: process.env.SERVICE_IMAGE_DAPI,
        },
    });
}

if (process.env.SERVICE_IMAGE_INSIGHT) {
    InsightApiOptions.setDefaultCustomOptions({
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
