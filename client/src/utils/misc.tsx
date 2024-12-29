export function randStr() {
    return (Math.random() + 1).toString(36).substring(7);
}

export function createPlayerOrder(numPlayers: number) {
    var rounds = Math.log(numPlayers)/Math.log(2)-1;
    var pls = [1,2];
    for(var i=0;i<rounds;i++){
      pls = nextLayer(pls);
    }
    return pls;
    function nextLayer(pls: number[]){
      var out: number[] = [];
      var length = pls.length*2+1;
      pls.forEach(function(d){
        out.push(d);
        out.push(length-d);
      });
      return out;
    }
}

export function sumBooleans(arr: boolean[]): number {
    return arr.reduce((sum, value) => sum + (value ? 1 : 0), 0);
}