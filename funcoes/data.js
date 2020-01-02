//Recebe um timeStamp e converte na data de hoje no formato dd-mm-yyyy
module.exports = function hoje(UNIX_timestamp){
  let a = new Date(UNIX_timestamp * 1000);
  let months = ['01','02','03','04','05','06','07','08','08','10','11','12'];
  let year = a.getFullYear();
  let month = months[a.getMonth()];
  let date = a.getDate();
  let time = date + '-' + month + '-' + year ;
  return time;
}