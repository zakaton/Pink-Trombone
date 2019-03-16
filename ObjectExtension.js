Object.defineProperties(Object, {
    get : {
        value : function(object, ...path) {
            var subObject = object;
            const isFound = path.every(key => {
                if(subObject[key] !== undefined) {
                    subObject = subObject[key];
                    return true;
                }
            });
            
            if(isFound)
                return subObject;
            else
                throw "Path not Valid!";
        }
    },
    set : {
        value : function(newValue, object, ...path) {
            const key = path[path.length-1];
            const subObject = this.get(object, ...path.slice(0, -1));

            if(subObject) {
                const oldValue = subObject[key];
                subObject[key] = newValue;
                return oldValue;
            }
            else
                return newValue;
        }
    },
})

export default Object;