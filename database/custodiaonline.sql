-- phpMyAdmin SQL Dump
-- version 4.8.4
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-04-2019 a las 09:22:57
-- Versión del servidor: 10.1.37-MariaDB
-- Versión de PHP: 7.3.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `custodiaonline`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `client`
--

CREATE TABLE `client` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `last_names` varchar(255) NOT NULL,
  `email` varchar(50) NOT NULL,
  `storage_size` int(11) NOT NULL COMMENT 'IN MB',
  `cifnif` varchar(255) NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `storage_in_use` float NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `client`
--

INSERT INTO `client` (`id`, `name`, `last_names`, `email`, `storage_size`, `cifnif`, `deleted`, `deleted_at`, `storage_in_use`) VALUES
(1008, 'Ellyn', 'D\'Onise', 'edonise0@google.de', 98, '374622453847567', 0, NULL, 0),
(1009, 'Rutter', 'Mathonnet', 'rmathonnet1@admin.ch', 64, '379997666629407', 1, NULL, 0),
(1010, 'Ingelbert', 'Piddock', 'ipiddock2@edublogs.org', 1, '5100149796184144', 0, NULL, 0),
(1011, 'Dov', 'Acutt', 'dacutt3@prnewswire.com', 72, '6759597042990783', 0, NULL, 0),
(1012, 'Norton', 'Mahon', 'nmahon4@dot.gov', 25, '30189308972822', 0, NULL, 0),
(1013, 'Sascha', 'Doulton', 'sdoulton5@hp.com', 6, '3581953600228499', 1, NULL, 0),
(1014, 'Ethelin', 'Sanper', 'esanper6@youtube.com', 48, '30371090366013', 0, NULL, 0),
(1015, 'Emmey', 'Bruntje', 'ebruntje7@cbsnews.com', 99, '5119178760118555', 0, NULL, 0),
(1016, 'Averell', 'Filippozzi', 'afilippozzi8@goo.gl', 12, '5602242996670661664', 0, NULL, 0),
(1017, 'Lenore', 'Costi', 'lcosti9@so-net.ne.jp', 7, '5610958827344573', 0, NULL, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuration`
--

CREATE TABLE `configuration` (
  `id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `department`
--

CREATE TABLE `department` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `client_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `department`
--

INSERT INTO `department` (`id`, `name`, `client_id`) VALUES
(1, 'Test department', 1010);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `file`
--

CREATE TABLE `file` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `creation_date` date NOT NULL,
  `last_update_date` date NOT NULL,
  `extension` varchar(7) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `file_tag_xref`
--

CREATE TABLE `file_tag_xref` (
  `file_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notification`
--

CREATE TABLE `notification` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `text` varchar(255) NOT NULL,
  `client_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sequelizemeta`
--

CREATE TABLE `sequelizemeta` (
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Volcado de datos para la tabla `sequelizemeta`
--

INSERT INTO `sequelizemeta` (`name`) VALUES
('20190326092844-add-cifnif.js'),
('20190326094026-cifnif-client.js'),
('20190328092130-client_Deleted.js'),
('20190403072510-deleted_At_field.js'),
('20190403073240-storage_in_use.js');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tag`
--

CREATE TABLE `tag` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `department_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `last_names` varchar(255) NOT NULL,
  `email` varchar(50) NOT NULL,
  `client_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `status` varchar(15) NOT NULL,
  `cifnif` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`id`, `name`, `last_names`, `email`, `client_id`, `department_id`, `status`, `cifnif`) VALUES
(130, 'Crissie', 'Lidell', 'clidells@nba.com', 1011, 1, 'tempus', '5048375258306512'),
(134, 'Kimbra', 'Nansom', 'knansomw@nytimes.com', 1011, 1, 'pending', '3582535680064032'),
(137, 'Tatiania', 'Cuttings', 'tcuttingsz@vimeo.com', 1011, 1, 'accepted', '5124776030029065'),
(138, 'Magnum', 'Feldberger', 'mfeldberger10@oaic.gov.au', 1011, 1, 'sollicitudin', '3562220067474682'),
(139, 'Angelita', 'Johann', 'ajohann11@wikia.com', 1011, 1, 'semper', '4844420431104266'),
(140, 'Marve', 'Bwye', 'mbwye12@independent.co.uk', 1011, 1, 'orci', '4041378219604'),
(141, 'Reeta', 'Ditch', 'rditch13@photobucket.com', 1011, 1, 'diam', '675928319105657656'),
(142, 'Alli', 'Worral', 'aworral14@weibo.com', 1011, 1, 'nullam', '3588323047537063'),
(143, 'Massimo', 'Di Roberto', 'mdiroberto15@blogspot.com', 1011, 1, 'augue', '3580282876610193'),
(144, 'Zacherie', 'Levay', 'zlevay16@hp.com', 1011, 1, 'turpis', '490520142356458863'),
(145, 'Balduin', 'L\'Hommee', 'blhommee17@wordpress.com', 1011, 1, 'ante', '3583809887078023'),
(146, 'Bran', 'Gomme', 'bgomme18@who.int', 1011, 1, 'nunc', '3548327607911138'),
(147, 'Aron', 'Silmon', 'asilmon19@usatoday.com', 1011, 1, 'elementum', '3552389602471214'),
(148, 'Marci', 'Englishby', 'menglishby1a@jalbum.net', 1011, 1, 'consequat', '5602219189521971'),
(149, 'Tuck', 'Clardge', 'tclardge1b@google.de', 1011, 1, 'maecenas', '4041594485885136'),
(150, 'Jillane', 'Gander', 'jgander1c@nytimes.com', 1011, 1, 'vestibulum', '3547221620907853'),
(151, 'Sidnee', 'Hornung', 'shornung1d@abc.net.au', 1011, 1, 'ac', '3532680351708524');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_file_xref`
--

CREATE TABLE `user_file_xref` (
  `user_id` int(11) NOT NULL,
  `file_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `configuration`
--
ALTER TABLE `configuration`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_Department_Client` (`client_id`);

--
-- Indices de la tabla `file`
--
ALTER TABLE `file`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `file_tag_xref`
--
ALTER TABLE `file_tag_xref`
  ADD UNIQUE KEY `UK_File_Tag` (`file_id`,`tag_id`) USING BTREE,
  ADD KEY `FK_FileTagXREF_Tag` (`tag_id`);

--
-- Indices de la tabla `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_Notification_Client` (`client_id`);

--
-- Indices de la tabla `sequelizemeta`
--
ALTER TABLE `sequelizemeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `tag`
--
ALTER TABLE `tag`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_Tag_Department` (`department_id`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_User_Client` (`client_id`),
  ADD KEY `FK_User_Department` (`department_id`);

--
-- Indices de la tabla `user_file_xref`
--
ALTER TABLE `user_file_xref`
  ADD UNIQUE KEY `UK_User_File` (`user_id`,`file_id`) USING BTREE,
  ADD KEY `FK_UserFileXREF_File` (`file_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `client`
--
ALTER TABLE `client`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1018;

--
-- AUTO_INCREMENT de la tabla `configuration`
--
ALTER TABLE `configuration`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `department`
--
ALTER TABLE `department`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `file`
--
ALTER TABLE `file`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notification`
--
ALTER TABLE `notification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tag`
--
ALTER TABLE `tag`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=152;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `department`
--
ALTER TABLE `department`
  ADD CONSTRAINT `FK_Department_Client` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`);

--
-- Filtros para la tabla `file_tag_xref`
--
ALTER TABLE `file_tag_xref`
  ADD CONSTRAINT `FK_FileTagXREF_File` FOREIGN KEY (`file_id`) REFERENCES `file` (`id`),
  ADD CONSTRAINT `FK_FileTagXREF_Tag` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`);

--
-- Filtros para la tabla `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `FK_Notification_Client` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`);

--
-- Filtros para la tabla `tag`
--
ALTER TABLE `tag`
  ADD CONSTRAINT `FK_Tag_Department` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`);

--
-- Filtros para la tabla `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `FK_User_Client` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  ADD CONSTRAINT `FK_User_Department` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`);

--
-- Filtros para la tabla `user_file_xref`
--
ALTER TABLE `user_file_xref`
  ADD CONSTRAINT `FK_UserFileXREF_File` FOREIGN KEY (`file_id`) REFERENCES `file` (`id`),
  ADD CONSTRAINT `FK_UserFileXREF_User` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
