/**
 * Created by chris.cao on 7/5/2017.
 */
import Qs from 'qs'

let configAdenservices = {
    baseURL: 'http://web.adenservices.com/adenapi',
    timeout: 300000,
    transformRequest: [
        (data) => {
            return Qs.stringify(data);
        }
    ]
};

export const configPhoto = configAdenservices

let config = {
    baseURL: 'http://' + window.location.host.split(":")[0] + '/AdenWebAPI',
    timeout: 300000,
    transformRequest: [
        (data) => {
            return Qs.stringify(data);
        }
    ]
};

export default config