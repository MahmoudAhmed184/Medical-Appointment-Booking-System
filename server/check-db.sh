#!/bin/bash

# Quick database check script
echo "==================================="
echo "Medical Appointment System - DB Check"
echo "==================================="
echo ""

mongosh mongodb://localhost:27017/medical-appointments --eval "
  print('📊 Database Statistics:');
  print('');
  
  print('Collections:');
  db.getCollectionNames().forEach(function(collection) {
    var count = db[collection].countDocuments();
    print('  - ' + collection + ': ' + count + ' documents');
  });
  
  print('');
  print('Database Size:');
  printjson(db.stats());
"
