/*
SQLyog Ultimate v8.32 
MySQL - 5.5.19 : Database - direct_seeding
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`direct_seeding` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `direct_seeding`;

/*Table structure for table `user` */

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(32) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(40) DEFAULT NULL,
  `user_password` varchar(64) DEFAULT NULL,
  `wacht_name` varchar(100) DEFAULT NULL,
  `wacht_open_id` varchar(128) DEFAULT NULL,
  `wacht_unit_id` varchar(128) DEFAULT NULL,
  `user_praise` int(10) DEFAULT '0' COMMENT '点赞数',
  `user_title` varchar(2) DEFAULT NULL COMMENT '职称',
  `user_pone` int(11) DEFAULT NULL COMMENT '电话号码',
  `user_sex` int(1) DEFAULT '0' COMMENT '0。没填 1.男，2女',
  `user_status` int(2) DEFAULT NULL COMMENT '0，无效。1有效',
  `create_time` datetime DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Data for the table `user` */

/*Table structure for table `user_praise` */

DROP TABLE IF EXISTS `user_praise`;

CREATE TABLE `user_praise` (
  `id` int(32) NOT NULL,
  `user_id` int(32) DEFAULT NULL,
  `direct_des` varchar(400) DEFAULT NULL,
  `direct_praise` int(10) DEFAULT NULL,
  `direct_type_id` int(32) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Data for the table `user_praise` */

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
