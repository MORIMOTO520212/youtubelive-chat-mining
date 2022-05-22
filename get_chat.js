import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';

// Express インスタンス
const app = express();
// json形式でパース
app.use(bodyParser.json());

// CROS設定
const allowCrossDomain = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, access_token'
    )
    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
}
app.use(allowCrossDomain);

const cookies = {
    'VISITOR_INFO1_LIVE': 'U0au2gzNt80',
    '_ga': 'GA1.2.177397464.1631949760',
    'HSID': 'AL8bONywzWDKDiv0u',
    'SSID': 'AkPWjamfBbzgZrEkT',
    'APISID': 'WP_-b_3idG_D9lSn/A6qNbLIwzlBPEEBs3',
    'SAPISID': 'OS1ekYIXfDITXTFC/Aj1DLV3aCPjHkEFKR',
    '__Secure-1PAPISID': 'OS1ekYIXfDITXTFC/Aj1DLV3aCPjHkEFKR',
    '__Secure-3PAPISID': 'OS1ekYIXfDITXTFC/Aj1DLV3aCPjHkEFKR',
    'LOGIN_INFO': 'AFmmF2swRQIhAJMUVaNNYxkit5oSWAyBiYQMKCu-bI8ws-0YVpcX1M9nAiAk-bT9DXYMOBWDJAcV2FUSc7sflLwsauxR8bgqI7jV1Q:QUQ3MjNmeEhSQVowRi1zVXNKWTVWVHplY25CcnNPWWFCN1EtbURockpldnVYWXlQaENrbWQ4Q2FnSERiWHQ4VmpMalJ4NmktaHJwZEFjd1VLYVNPd2lFNmNEY2JHRktLVVhXQ0dKMnc2U2xldGRXbXA5bDZCWjlrRVpyZGZNcFF4SHJGVnRtRWRWcWZKTXRGLVJ5WVZfWW5MVXAxenpjbnJB',
    'PREF': 'tz=Asia.Tokyo&f6=40000400&f5=30000&volume=45',
    'SID': 'JgjCcJc2jkcm776NbVA3D7xtlOX6ddbFQSeAbFv7AsQfwYGS8ggzqHBojUZ0F6wirt6KHw.',
    '__Secure-1PSID': 'JgjCcJc2jkcm776NbVA3D7xtlOX6ddbFQSeAbFv7AsQfwYGSO3oBMS6Ho4jWO-JSI_SpdQ.',
    '__Secure-3PSID': 'JgjCcJc2jkcm776NbVA3D7xtlOX6ddbFQSeAbFv7AsQfwYGS5WvpM0DbjnNcku2wMzJsRQ.',
    'YSC': 'A0TGC7Hp514',
    'SIDCC': 'AJi4QfGdXUyuV_lbmc9M6eT9qXXM6_K6TKOnUldwOU728lhjeENG84ES6XNa72LKkwId_35gJCZT',
    '__Secure-3PSIDCC': 'AJi4QfFQSRQlMRs_aTMOBgFqctrpNMt4j_6qmb3bKi5eBP-uNZ2bgH6awa6mX-_Olobe_6pyupo',
}

function getContinuation(videoId){
    console.log("get continuation.");
    return new Promise((resolve, reject) => {
        fetch(`https://www.youtube.com/watch?v=${videoId}`)
            .then((response) => {
                response.text().then((text) => {
                    let res = text.match("var ytInitialData = {.*}}}}");
                    res = res[0].replace("var ytInitialData = ", "");
                    let ytInitialData = JSON.parse(res);
                    let continuation_key = ytInitialData['contents']['twoColumnWatchNextResults']['conversationBar']['liveChatRenderer']['continuations'][0]['reloadContinuationData']['continuation'];
                    resolve(continuation_key);
                });
            });
    });
}

function getChat(videoId, continuation_key){
    console.log("get chat.");
    const header = {
        authority: 'www.youtube.com',
        accept: '*/*',
        'accept-language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
        dnt: '1',
        origin: 'https://www.youtube.com',
        referer: 'https://www.youtube.com/live_chat?is_popout=1&v='+videoId,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
        'x-goog-authuser': '0',
        'x-goog-visitor-id': 'CgtVMGF1Mmd6TnQ4MCiI2bmTBg%3D%3D',
        'x-origin': 'https://www.youtube.com',
        'x-youtube-bootstrap-logged-in': 'true',
        'x-youtube-client-name': '1',
        'x-youtube-client-version': '2.20220429.00.00',
        cookie: cookies
    }
    const payload = {
        'context': {
            'client': {
                'hl': 'ja',
                'gl': 'JP',
                'remoteHost': '221.242.137.177',
                'deviceMake': '',
                'deviceModel': '',
                'visitorData': 'CgtVMGF1Mmd6TnQ4MCiI2bmTBg%3D%3D',
                'userAgent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36,gzip(gfe)',
                'clientName': 'WEB',
                'clientVersion': '2.20220429.00.00',
                'osName': 'Windows',
                'osVersion': '10.0',
                'originalUrl': 'https://www.youtube.com/live_chat?is_popout=1&v='+videoId,
                'platform': 'DESKTOP',
                'clientFormFactor': 'UNKNOWN_FORM_FACTOR',
                'configInfo': {
                    'appInstallData': 'CIjZuZMGEPyLrgUQ8IKuBRDokK4FEJOPrgUQgo6uBRCY3v0SEJjqrQUQuIuuBRDUg64FELfLrQUQ6pCuBRCq2q0FENfh_RIQ2L6tBRCR-PwS'
                },
                'userInterfaceTheme': 'USER_INTERFACE_THEME_DARK',
                'timeZone': 'Asia/Tokyo',
                'browserName': 'Chrome',
                'browserVersion': '100.0.4896.127',
                'screenWidthPoints': 600,
                'screenHeightPoints': 599,
                'screenPixelDensity': 1,
                'screenDensityFloat': 1,
                'utcOffsetMinutes': 540,
                'connectionType': 'CONN_CELLULAR_4G',
                'memoryTotalKbytes': '8000000',
                'mainAppWebInfo': {
                    'graftUrl': 'https://www.youtube.com/live_chat?is_popout=1&v='+videoId,
                    'webDisplayMode': 'WEB_DISPLAY_MODE_BROWSER',
                    'isWebNativeShareAvailable': true
                }
            },
            'user': {
                'lockedSafetyMode': false
            },
            'request': {
                'useSsl': true,
                'internalExperimentFlags': [],
                'consistencyTokenJars': []
            },
            'clickTracking': {'clickTrackingParams': 'CAEQl98BIhMIzrnCga2-9wIVzUcqCh1x6AGT'},
            'adSignalsInfo': {
                'params': [
                    {"key":"dt","value":"1651421056459"},
                    {"key":"flash","value":"0"},
                    {"key":"frm","value":"1"},
                    {"key":"u_tz","value":"540"},
                    {"key":"u_his","value":"10"},
                    {"key":"u_h","value":"1080"},
                    {"key":"u_w","value":"1920"},
                    {"key":"u_ah","value":"1040"},
                    {"key":"u_aw","value":"1920"},
                    {"key":"u_cd","value":"24"},
                    {"key":"bc","value":"31"},
                    {"key":"bih","value":"788"},
                    {"key":"biw","value":"1395"},
                    {"key":"brdim","value":"1942,75,1942,75,1920,0,1427,908,400,561"},
                    {"key":"vis","value":"1"},
                    {"key":"wgl","value":"true"},
                    {"key":"ca_type","value":"image"}
                ],
            }
        },
        'continuation': continuation_key,
        'webClientInfo': {
            'isDocumentHidden': true,
        },
    }
    const options = {
        method: "POST",
        headers: header,
        body: JSON.stringify(payload)
    }

    return new Promise((resolve, reject) => {
        fetch("https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&prettyPrint=false", options)
            .then((response) => {
                response.json().then((body) => {
                    resolve(body);
                });
            })
            .catch((error) => {
                resolve(error);
            });
    });
}

/*
    リクエスト１
    GET http://localhost:3000/continuation
    RES コンティニュエーションキー

    リクエスト２
    GET http://localhost:3000/chat
    RES ライブチャットデータ
*/
app.get('/continuation', (req, res) => {
    let videoId = req.query.id;
    getContinuation(videoId).then((continuation_key) => {
        res.send(continuation_key);
    });
});

app.get('/chat', (req, res) => {
    let videoId = req.query.id;
    let continuation_key = req.query.continuation;
    getChat(videoId, continuation_key).then(live_chat => {
        res.json(live_chat);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));