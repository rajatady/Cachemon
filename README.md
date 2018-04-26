## Modules

<dl>
<dt><a href="#module_Cachemon">Cachemon</a></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#CacheMonClient">CacheMonClient</a> ⇐ <code>EventEmitter</code></dt>
<dd></dd>
</dl>

## Constants

<dl>
<dt><a href="#exp_module_Cachemon--exports.initialize">exports.initialize</a> ⇒ <code>Promise.&lt;any&gt;</code> ⏏</dt>
<dd></dd>
<dt><a href="#exp_module_Cachemon--exports.resource">exports.resource</a> ⇒ <code><a href="#CacheMonClient">CacheMonClient</a></code> ⏏</dt>
<dd></dd>
<dt><a href="#exp_module_Cachemon--exports.hasKey">exports.hasKey</a> ⇒ ⏏</dt>
<dd></dd>
<dt><a href="#exp_module_Cachemon--exports.cacheMiddleware">exports.cacheMiddleware</a> ⇒ <code>function</code> ⏏</dt>
<dd></dd>
<dt><a href="#exp_module_Cachemon--exports.getResource">exports.getResource</a> ⇒ <code>*</code> ⏏</dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#exp_module_Cachemon--generateHash">generateHash(str)</a> ⇒ <code>*</code> | <code>PromiseLike.&lt;ArrayBuffer&gt;</code> ⏏</dt>
<dd></dd>
<dt><a href="#setData">setData(key, value)</a> ⇒ <code>Promise.&lt;any&gt;</code></dt>
<dd><p>Set some data in the resource. The key will be prefixed with the resource name specified earlier</p>
</dd>
<dt><a href="#getData">getData(key)</a> ⇒ <code>Promise.&lt;any&gt;</code></dt>
<dd><p>Get some data from the resource. The key will be prefixed with the resource name specified earlier</p>
</dd>
<dt><a href="#setResourcePool">setResourcePool(resourcePoolData)</a> ⇒ <code>Promise.&lt;any&gt;</code></dt>
<dd><p>Sets the data in the resource pool</p>
</dd>
<dt><a href="#getResourcePool">getResourcePool()</a> ⇒ <code>Promise.&lt;any&gt;</code></dt>
<dd><p>Get the data from the resource pool</p>
</dd>
<dt><a href="#appendToResourcePool">appendToResourcePool(appendData)</a> ⇒ <code>Promise.&lt;any&gt;</code></dt>
<dd></dd>
<dt><a href="#updateResourcePool">updateResourcePool(updateData, preventEmit)</a> ⇒ <code>Promise.&lt;any&gt;</code></dt>
<dd></dd>
<dt><a href="#runCronJob">runCronJob()</a></dt>
<dd></dd>
<dt><a href="#saveMeta">saveMeta(key, value)</a> ⇒ <code>Promise.&lt;any&gt;</code></dt>
<dd><p>Set the meta info in the cache</p>
</dd>
<dt><a href="#getMeta">getMeta()</a> ⇒ <code>Promise.&lt;any&gt;</code></dt>
<dd><p>Get the meta info saved in the cache</p>
</dd>
<dt><a href="#invalidateResourcePool">invalidateResourcePool()</a> ⇒ <code>Promise.&lt;any&gt;</code></dt>
<dd></dd>
<dt><a href="#runUdaterFunction">runUdaterFunction()</a></dt>
<dd><p>Manually run the updater function</p>
</dd>
</dl>

<a name="module_Cachemon"></a>

## Cachemon

* [Cachemon](#module_Cachemon)
    * [exports.initialize](#exp_module_Cachemon--exports.initialize) ⇒ <code>Promise.&lt;any&gt;</code> ⏏
    * [exports.resource](#exp_module_Cachemon--exports.resource) ⇒ [<code>CacheMonClient</code>](#CacheMonClient) ⏏
    * [exports.hasKey](#exp_module_Cachemon--exports.hasKey) ⇒ ⏏
    * [exports.cacheMiddleware](#exp_module_Cachemon--exports.cacheMiddleware) ⇒ <code>function</code> ⏏
    * [exports.getResource](#exp_module_Cachemon--exports.getResource) ⇒ <code>\*</code> ⏏
    * [generateHash(str)](#exp_module_Cachemon--generateHash) ⇒ <code>\*</code> \| <code>PromiseLike.&lt;ArrayBuffer&gt;</code> ⏏

<a name="exp_module_Cachemon--exports.initialize"></a>

### exports.initialize ⇒ <code>Promise.&lt;any&gt;</code> ⏏
**Kind**: global constant of [<code>Cachemon</code>](#module_Cachemon)  

| Param |
| --- |
| config | 

<a name="exp_module_Cachemon--exports.resource"></a>

### exports.resource ⇒ [<code>CacheMonClient</code>](#CacheMonClient) ⏏
**Kind**: global constant of [<code>Cachemon</code>](#module_Cachemon)  

| Param |
| --- |
| clientConfig | 

**Example**  
```js
const cnrCache = new CacheMonClient({
        name: 'DATA',
        executeCronJob: false,
        cronPeriod: '0 * * * * *',
        cronExecutorFn: (done) => {
            i++;
            console.log('Running');
            request({
                url: 'https://api.github.com/users/rajatady/repos?per_page=10',
                headers: {
                    'User-Agent': 'request'
                }
            }, (err, response, body) => {
                if (err) {
                    done();
                } else {
                    cnrCache.updateResourcePool(body)
                        .then(res => {
                            console.log('Done');
                        })
                        .catch(err => {
                            console.log(err);
                        })
                }
            });
        },
        requestMethod: 'GET',
        urlDomain: '/data'
    });


 cnrCache.on('updated', (data) => {
        console.log('Updated');
    });

 export default resource(cnrCache);
```
<a name="exp_module_Cachemon--exports.hasKey"></a>

### exports.hasKey ⇒ ⏏
**Kind**: global constant of [<code>Cachemon</code>](#module_Cachemon)  
**Returns**: Promise  

| Param | Type |
| --- | --- |
| url |  | 
| cacheModel | [<code>CacheMonClient</code>](#CacheMonClient) | 

<a name="exp_module_Cachemon--exports.cacheMiddleware"></a>

### exports.cacheMiddleware ⇒ <code>function</code> ⏏
**Kind**: global constant of [<code>Cachemon</code>](#module_Cachemon)  

| Param | Type |
| --- | --- |
| cacheModel | [<code>CacheMonClient</code>](#CacheMonClient) | 

<a name="exp_module_Cachemon--exports.getResource"></a>

### exports.getResource ⇒ <code>\*</code> ⏏
**Kind**: global constant of [<code>Cachemon</code>](#module_Cachemon)  

| Param |
| --- |
| resourceName | 

<a name="exp_module_Cachemon--generateHash"></a>

### generateHash(str) ⇒ <code>\*</code> \| <code>PromiseLike.&lt;ArrayBuffer&gt;</code> ⏏
**Kind**: global method of [<code>Cachemon</code>](#module_Cachemon)  

| Param |
| --- |
| str | 

<a name="CacheMonClient"></a>

## CacheMonClient ⇐ <code>EventEmitter</code>
**Kind**: global class  
**Extends**: <code>EventEmitter</code>  
<a name="new_CacheMonClient_new"></a>

### new CacheMonClient(options)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | The options for the Cachemon Client |
| options.name | <code>String</code> |  | The name of the client for which resources have to be scoped |
| [options.allowFiltering] | <code>String</code> |  | Whether the domain should allow data filtering (Planned) |
| [options.urlDomain] | <code>String</code> |  | The url domain registered with express. To be used for advanced caching (Planned) |
| [options.requestMethod] | <code>String</code> | <code>GET</code> | The HTTP request method for the url domain (Planned) |
| [options.cronPeriod] | <code>String</code> |  | The cron period in a standard glob format. Refer to https://www.npmjs.com/package/node-cron for more |
| [options.purgeCronPeriod] | <code>String</code> |  | The cron period for the purge function in a standard glob format. Refer to https://www.npmjs.com/package/node-cron for more |
| [options.executeCronJob] | <code>Boolean</code> |  | Should the cron function be executed |
| [options.cronExecutorFn] | <code>function</code> |  | The function to be executed whenever the cron job runs |
| [options.updaterFn] | <code>function</code> |  | The function to be executed whenever request is served from cache |
| [options.purgeFn] | <code>function</code> |  | The function to be executed whenever cron time for purge is reached |
| [options.shouldRunUpdater] | <code>Boolean</code> | <code>false</code> | Should the updater function run |
| [options.shouldRunPurge] | <code>Boolean</code> | <code>false</code> | Should the purge function run |
| [options.maintainUrls] | <code>Boolean</code> | <code>false</code> | Should a new data pool be created based on request url |
| [options.preSendCallback] | <code>function</code> |  | The function which gets the control once the data from cache is evaluated and is ready to be sent |

<a name="setData"></a>

## setData(key, value) ⇒ <code>Promise.&lt;any&gt;</code>
Set some data in the resource. The key will be prefixed with the resource name specified earlier

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The key to be put in the cache |
| value | <code>String</code> | The data to be saved |

<a name="getData"></a>

## getData(key) ⇒ <code>Promise.&lt;any&gt;</code>
Get some data from the resource. The key will be prefixed with the resource name specified earlier

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The key to fetch from the cache |

<a name="setResourcePool"></a>

## setResourcePool(resourcePoolData) ⇒ <code>Promise.&lt;any&gt;</code>
Sets the data in the resource pool

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| resourcePoolData | <code>String</code> | Set the data in the resource pool |

<a name="getResourcePool"></a>

## getResourcePool() ⇒ <code>Promise.&lt;any&gt;</code>
Get the data from the resource pool

**Kind**: global function  
<a name="appendToResourcePool"></a>

## appendToResourcePool(appendData) ⇒ <code>Promise.&lt;any&gt;</code>
**Kind**: global function  

| Param |
| --- |
| appendData | 

<a name="updateResourcePool"></a>

## updateResourcePool(updateData, preventEmit) ⇒ <code>Promise.&lt;any&gt;</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| updateData |  | 
| preventEmit | <code>Boolean</code> | 

<a name="runCronJob"></a>

## runCronJob()
**Kind**: global function  
<a name="saveMeta"></a>

## saveMeta(key, value) ⇒ <code>Promise.&lt;any&gt;</code>
Set the meta info in the cache

**Kind**: global function  

| Param |
| --- |
| key | 
| value | 

<a name="getMeta"></a>

## getMeta() ⇒ <code>Promise.&lt;any&gt;</code>
Get the meta info saved in the cache

**Kind**: global function  
<a name="invalidateResourcePool"></a>

## invalidateResourcePool() ⇒ <code>Promise.&lt;any&gt;</code>
**Kind**: global function  
<a name="runUdaterFunction"></a>

## runUdaterFunction()
Manually run the updater function

**Kind**: global function  
