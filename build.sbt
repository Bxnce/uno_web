ThisBuild / scalaVersion := "2.13.10"

ThisBuild / version := "1.0"
scalacOptions += "-Ytasty-reader"
exportJars := true

lazy val root = (project in file("."))
    .enablePlugins(PlayScala, SbtWeb)
    .settings(
        name:= """UNO-Web""",
        includeFilter in (Assets, LessKeys.less) := "*.less",
        libraryDependencies ++= Seq(
            guice,
            "org.scalatestplus.play" %% "scalatestplus-play" % "5.1.0" % Test,
            "com.fasterxml.jackson.module" %% "jackson-module-scala" % "2.11.4"
        )
    )
