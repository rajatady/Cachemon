## Modules

<dl>
<dt><a href="#module_Cachemon">Cachemon</a></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#CacheMonClient">CacheMonClient</a> ⇐ <code>EventEmitter</code></dt>
<dd><p>const cnrCache = new CacheMonClient({
        name: &#39;DATA&#39;,
        executeCronJob: false,
        cronPeriod: &#39;0 <em> </em> <em> </em> *&#39;,
        cronExecutorFn: (done) =&gt; {
            i++;
            console.log(&#39;Running&#39;);
            request({
                url: &#39;<a href="https://api.github.com/users/rajatady/repos?per_page=10&#39;">https://api.github.com/users/rajatady/repos?per_page=10&#39;</a>,
                headers: {
                    &#39;User-Agent&#39;: &#39;request&#39;
                }
            }, (err, response, body) =&gt; {
                if (err) {
                    done();
                } else {
                    cnrCache.updateResourcePool(body)
                        .then(res =&gt; {
                            console.log(&#39;Done&#39;);
                        })
                        .catch(err =&gt; {
                            console.log(err);
                        })
                }
            });
        },
        requestMethod: &#39;GET&#39;,
        urlDomain: &#39;/data&#39;
    });</p>
<p> cnrCache.on(&#39;updated&#39;, (data) =&gt; {
        console.log(&#39;Updated&#39;);
    });</p>
<p> export default resource(cnrCache);</p>
</dd>
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
<dt><a href="#updateResourcePool">updateResourcePool(updateData)</a> ⇒ <code>Promise.&lt;any&gt;</code></dt>
<dd></dd>
<dt><a href="#runCronJob">runCronJob()</a></dt>
<dd></dd>
<dt><a href="#invalidateResourcePool">invalidateResourcePool()</a> ⇒ <code>Promise.&lt;any&gt;</code></dt>
<dd></dd>
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

**Kind**: global class  
**Extends**: <code>EventEmitter</code>  
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

## updateResourcePool(updateData) ⇒ <code>Promise.&lt;any&gt;</code>
**Kind**: global function  

| Param |
| --- |
| updateData | 

<a name="runCronJob"></a>

## runCronJob()
**Kind**: global function  
<a name="invalidateResourcePool"></a>

## invalidateResourcePool() ⇒ <code>Promise.&lt;any&gt;</code>
**Kind**: global function  
