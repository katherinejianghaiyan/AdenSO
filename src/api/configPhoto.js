/**
 * Created by chris.cao on 7/5/2017.
 */
import Qs from 'qs'

let config = {
    baseURL: 'http://web.adenservices.com/adenapi/api',
    timeout: 300000,
    transformRequest: [
        (data) => {
            return Qs.stringify(data);
        }
    ]
};

export default config