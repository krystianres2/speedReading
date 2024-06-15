$(document).ready(function () {
    class User {
      constructor(username, level, points) {
        this.username = username;
        this.level = level;
        this.points = points;
      }
    }
  
    let currentSortOrder = 'asc';
    let currentPage = 1;
    const rowsPerPage = 10;
    let userList = [];
  
    function loadData() {
      $.getJSON("/get_ranking_data", function (data) {
        userList = data.map(item => new User(item.username, item.level, item.points));
        sortListByPoints(currentSortOrder);
        displayList();
        updatePaginationInfo();
      });
    }
  
    function sortListByPoints(order) {
      userList.sort((a, b) => order === 'asc' ? a.points - b.points : b.points - a.points);
    }
  
    function displayList() {
      const $tableBody = $("#table_body");
      $tableBody.empty();
      let start = (currentPage - 1) * rowsPerPage;
      let end = start + rowsPerPage;
      let pageList = userList.slice(start, end);
  
      pageList.forEach((user, index) => {
        const $row = $("<tr></tr>");
        $("<td></td>").text(start + index + 1).appendTo($row);
        $("<td></td>").text(user.username).appendTo($row);
        $("<td></td>").text(user.level).appendTo($row);
        $("<td></td>").text(user.points).appendTo($row);
        $tableBody.append($row);
      });
    }
  
    function updatePaginationInfo() {
      const totalPages = Math.ceil(userList.length / rowsPerPage);
      $("#page_info").text(`Strona ${currentPage} z ${totalPages}`);
    }
  
    $("#sort_points").on("click", function () {
      currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
      sortListByPoints(currentSortOrder);
      displayList();
      $(".sort-indicator").text(currentSortOrder === 'asc' ? '▲' : '▼');
    });
  
    $("#prev_page").on("click", function () {
      if (currentPage > 1) {
        currentPage--;
        displayList();
        updatePaginationInfo();
      }
    });
  
    $("#next_page").on("click", function () {
      const totalPages = Math.ceil(userList.length / rowsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        displayList();
        updatePaginationInfo();
      }
    });
  
    loadData();
  });
  